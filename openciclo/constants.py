# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

"""Project-wide constants. Thresholds here are documented assumptions, not medical facts."""

from datetime import date

ENGINE_VERSION = "0.3.0"
ENGINE_NAME = "openciclo"

# Discrete support for V0 cycle-length PMFs (calendar days from last start to next start).
MIN_CYCLE_LENGTH = 1
MAX_CYCLE_LENGTH = 90

# Unusual-but-valid bands. Values outside these are kept unless mathematically impossible.
# 24–38 days is the adult range used by the US Office on Women's Health and FIGO, and the
# range the Learn articles give for "worth getting checked". These only add NOTE-level
# quality issues; they never change the forecast.
UNUSUAL_SHORT_DAYS = 24
UNUSUAL_LONG_DAYS = 38
SUSPICIOUS_SHORT_DAYS = 10
SUSPICIOUS_LONG_DAYS = 60
INCOMPLETE_HISTORY_DAYS = 40

DEFAULT_ROLLING_WINDOW = 6
DEFAULT_RECENCY_LAMBDA = 0.90
RECENCY_LAMBDA_GRID = (0.70, 0.80, 0.90, 0.95, 1.00)

# Laplace scale floor so identical histories do not imply certainty.
MIN_LAPLACE_SCALE = 0.75

# Literature population prior (docs/modeling.md "Population prior"). Published aggregates only;
# nothing in this repository was fitted to get these numbers, and no restricted dataset enters them.
# Location: mean of the two largest published cycle-length means, rounded to a whole day:
#   Bull et al. 2019, npj Digit Med 2:83 (CC BY 4.0): 29.3 days, 612,613 ovulatory cycles;
#   Li et al. 2023, npj Digit Med 6:100 (Apple Women's Health Study): 28.7 days, 165,668 cycles.
# Spread: MAD 3 days. Bull's Table 1 (cohort n, mean, SD) implies a pooled MAD near 2 days for
# ovulatory cycles; the Apple study's wider SD (6.1 days) implies more. 3 sits between the two
# and was confirmed on mcPHASES and Utah walk-forward (docs/evaluation.md).
LITERATURE_PRIOR_MEDIAN = 29.0
LITERATURE_PRIOR_MAD = 3.0
LITERATURE_PRIOR_MEAN = 29.0
LITERATURE_PRIOR_SOURCE = "published literature (Bull 2019; Li 2023)"

SYNTHETIC_DATA_NOTICE = "SYNTHETIC / NON-PRODUCTION"
MCPHASES_DATA_NOTICE = "mcPHASES restricted / do not redistribute"
MCPHASES_CSV_ENV = "OPENCICLO_MCPHASES_CSV"

DEFAULT_SHRINKAGE_K = 2.0
DEFAULT_LENGTH_FAMILY = "laplace"
DEFAULT_LOGNORMAL_SIGMA = 0.18

CREIGHTON_DATA_NOTICE = "Creighton/Utah cycle lengths / do not redistribute"
CREIGHTON_CSV_ENV = "OPENCICLO_CREIGHTON_CSV"
KAGGLE_FACTORS_DATA_NOTICE = "Kaggle synthetic cycle factors / non-production"
KAGGLE_FACTORS_CSV_ENV = "OPENCICLO_KAGGLE_FACTORS_CSV"
MCPHASES_EPOCH = date(1970, 1, 1)
MENSTRUAL_PHASE = "Menstrual"

PROBABILITY_WINDOWS = (1, 2, 3, 5)
DEFAULT_INTERVAL_COVERAGE = 0.80
PMF_FLOOR = 1e-12
