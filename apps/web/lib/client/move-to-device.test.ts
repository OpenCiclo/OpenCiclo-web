// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { AccountNotFoundError, HttpError, VaultChangedError, type VaultBlob } from "@/lib/client/api";
import { RequestTimeoutError, UpdateRequiredError } from "@/lib/client/http";
import { DIARY_SCHEMA_VERSION, NewerDiaryError, emptyDiary, type Diary } from "@/lib/diary";

import { DeviceDiaryExistsError, moveHostedDiaryToDevice, type MoveToDeviceSteps } from "./move-to-device";

// A fake host and device. Blobs are the diary as JSON, so the test can read
// what ended up on the device.
function setup(options: {
  hosted: Diary;
  hostedVersion?: number;
  deviceHasDiary?: boolean;
  deleteHosted?: MoveToDeviceSteps["deleteHosted"];
  probeHosted?: MoveToDeviceSteps["probeHosted"];
  storePhrase?: MoveToDeviceSteps["storePhrase"];
  open?: MoveToDeviceSteps["open"];
}) {
  const state = {
    device: null as Diary | null,
    phraseStored: false,
    hostedExists: true,
    deleteCalls: [] as number[],
  };
  const steps: MoveToDeviceSteps = {
    loadHosted: async () => ({
      blob: { ciphertext: JSON.stringify(options.hosted), nonce: "n", schemaVersion: DIARY_SCHEMA_VERSION },
      version: options.hostedVersion ?? 4,
    }),
    open: options.open ?? (async (blob: VaultBlob) => JSON.parse(blob.ciphertext) as Diary),
    seal: async (diary) => ({ ciphertext: JSON.stringify(diary), nonce: "n", schemaVersion: diary.schemaVersion }),
    writeDevice: async (blob) => {
      if (options.deviceHasDiary) return false;
      state.device = JSON.parse(blob.ciphertext) as Diary;
      return true;
    },
    storePhrase:
      options.storePhrase ??
      (async () => {
        state.phraseStored = true;
      }),
    clearDevice: async () => {
      state.device = null;
      state.phraseStored = false;
    },
    deleteHosted: async (baseVersion) => {
      state.deleteCalls.push(baseVersion);
      if (options.deleteHosted) return options.deleteHosted(baseVersion);
      state.hostedExists = false;
    },
    probeHosted:
      options.probeHosted ??
      (async () => {
        if (!state.hostedExists) throw new AccountNotFoundError();
      }),
  };
  return { steps, state };
}

const hostedDiary: Diary = {
  ...emptyDiary("en"),
  recoveryEmailSet: true,
  days: { "2026-03-02": { flow: "light", symptoms: {} } },
  periodStarts: ["2026-03-02"],
};

describe("moveHostedDiaryToDevice", () => {
  it("copies the host's latest diary, then deletes the account at that version", async () => {
    const { steps, state } = setup({ hosted: hostedDiary, hostedVersion: 9 });
    const result = await moveHostedDiaryToDevice(steps);
    expect(result.hostedDeleted).toBe("confirmed");
    expect(state.device?.days).toEqual(hostedDiary.days);
    // The email sign-in went with the account.
    expect(state.device?.recoveryEmailSet).toBe(false);
    expect(state.phraseStored).toBe(true);
    expect(state.deleteCalls).toEqual([9]);
  });

  it("removes the device copy when another device saved during the move", async () => {
    const { steps, state } = setup({
      hosted: hostedDiary,
      deleteHosted: async () => {
        throw new VaultChangedError();
      },
    });
    await expect(moveHostedDiaryToDevice(steps)).rejects.toBeInstanceOf(VaultChangedError);
    expect(state.device).toBeNull();
    expect(state.hostedExists).toBe(true);
  });

  it("removes the device copy when the host refuses the delete outright", async () => {
    for (const refusal of [new HttpError(401, "Not authenticated"), new UpdateRequiredError()]) {
      const { steps, state } = setup({
        hosted: hostedDiary,
        deleteHosted: async () => {
          throw refusal;
        },
      });
      await expect(moveHostedDiaryToDevice(steps)).rejects.toBe(refusal);
      expect(state.device).toBeNull();
    }
  });

  it("finishes the move when the delete went through but its answer was lost", async () => {
    let calls = 0;
    const { steps, state } = setup({
      hosted: hostedDiary,
      deleteHosted: async () => {
        calls += 1;
        state.hostedExists = false;
        throw new TypeError("Failed to fetch");
      },
    });
    const result = await moveHostedDiaryToDevice(steps);
    expect(result.hostedDeleted).toBe("confirmed");
    expect(state.device).not.toBeNull();
    expect(calls).toBe(1);
  });

  it("keeps the device copy and tries once more when the host still has the account after a lost answer", async () => {
    let calls = 0;
    const { steps, state } = setup({
      hosted: hostedDiary,
      deleteHosted: async () => {
        calls += 1;
        if (calls === 1) throw new RequestTimeoutError();
        state.hostedExists = false;
      },
    });
    const result = await moveHostedDiaryToDevice(steps);
    expect(result.hostedDeleted).toBe("confirmed");
    expect(state.device).not.toBeNull();
    expect(calls).toBe(2);
  });

  it("never removes the device copy when it cannot tell whether the delete happened", async () => {
    // The first delete may still land later (a timed-out request keeps going),
    // so even a 401 on the retry says nothing: its cookie may already be gone.
    const lost = [
      { deleteError: new TypeError("Failed to fetch"), probe: async () => { throw new TypeError("offline"); } },
      { deleteError: new HttpError(502, "Bad gateway"), probe: async () => { throw new RequestTimeoutError(); } },
      { deleteError: new RequestTimeoutError(), probe: async () => {}, retryError: new HttpError(401, "Not authenticated") },
      { deleteError: new RequestTimeoutError(), probe: async () => {}, retryError: new HttpError(503, "Unavailable") },
    ];
    for (const { deleteError, probe, retryError } of lost) {
      let calls = 0;
      const { steps, state } = setup({
        hosted: hostedDiary,
        probeHosted: probe,
        deleteHosted: async () => {
          calls += 1;
          throw calls === 1 ? deleteError : (retryError ?? deleteError);
        },
      });
      const result = await moveHostedDiaryToDevice(steps);
      expect(result.hostedDeleted).toBe("unconfirmed");
      expect(state.device?.days).toEqual(hostedDiary.days);
      expect(state.phraseStored).toBe(true);
    }
  });

  it("drops the out-of-date device copy when the retry finds that another device saved", async () => {
    // Neither delete can land: both ask for the copied version, and the vault moved on.
    let calls = 0;
    const { steps, state } = setup({
      hosted: hostedDiary,
      deleteHosted: async () => {
        calls += 1;
        throw calls === 1 ? new RequestTimeoutError() : new VaultChangedError();
      },
    });
    await expect(moveHostedDiaryToDevice(steps)).rejects.toBeInstanceOf(VaultChangedError);
    expect(state.device).toBeNull();
    expect(state.hostedExists).toBe(true);
  });

  it("deletes nothing when the phrase cannot be sealed", async () => {
    const { steps, state } = setup({
      hosted: hostedDiary,
      storePhrase: async () => {
        throw new Error("Keystore unavailable");
      },
    });
    await expect(moveHostedDiaryToDevice(steps)).rejects.toThrow("Keystore unavailable");
    expect(state.device).toBeNull();
    expect(state.deleteCalls).toEqual([]);
  });

  it("never replaces a device diary that is already there", async () => {
    const { steps, state } = setup({ hosted: hostedDiary, deviceHasDiary: true });
    await expect(moveHostedDiaryToDevice(steps)).rejects.toBeInstanceOf(DeviceDiaryExistsError);
    expect(state.deleteCalls).toEqual([]);
  });

  it("stops before writing anything when a newer build saved the hosted diary", async () => {
    const { steps, state } = setup({
      hosted: hostedDiary,
      open: async () => {
        throw new NewerDiaryError(DIARY_SCHEMA_VERSION + 1);
      },
    });
    await expect(moveHostedDiaryToDevice(steps)).rejects.toBeInstanceOf(NewerDiaryError);
    expect(state.device).toBeNull();
    expect(state.deleteCalls).toEqual([]);
  });
});
