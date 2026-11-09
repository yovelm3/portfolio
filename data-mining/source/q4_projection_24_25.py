import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # backend ללא חלון (לא דורש Tkinter)
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

# =========================================
# Utilities
# =========================================

def load_csv_safely(path: str) -> pd.DataFrame:
    encodings_to_try = ["utf-8-sig", "cp1255", "iso-8859-8", "cp1252", "latin1"]
    seps_to_try = [",", ";"]
    last_err = None

    for enc in encodings_to_try:
        for sep in seps_to_try:
            try:
                df = pd.read_csv(path, encoding=enc, sep=sep)
                if df.shape[1] == 1:
                    continue
                return df
            except Exception as e:
                last_err = e

    raise RuntimeError(f"Failed to read CSV: {path}\nLast error: {last_err}")


def pick_first_existing(df: pd.DataFrame, candidates: list[str]):
    for c in candidates:
        if c in df.columns:
            return c
    return None


def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(",", "").str.strip(),
        errors="coerce"
    ).fillna(0)


def column_name_mapping(df: pd.DataFrame, mapping: dict[str, list[str]], *, strict: bool = True) -> dict[str, str]:
    resolved = {}
    missing = []

    for canonical, candidates in mapping.items():
        found = None
        for c in candidates:
            if c in df.columns:
                found = c
                break
        if found is None:
            missing.append(canonical)
        else:
            resolved[canonical] = found

    if strict and missing:
        raise ValueError(
            f"Missing required columns for mapping: {missing}\n\nAvailable columns:\n{list(df.columns)}"
        )

    return resolved


# =========================================
# Load files (PyCharm: same folder as .py)
# =========================================
df24 = load_csv_safely("2024_cities.csv")
df25 = load_csv_safely("2025_cities.csv")

# =========================================
# 4d: Keep only cities appearing in both datasets (by City Name)
# + FIX: enforce same ORDER of cities in both datasets
# =========================================
city_name_candidates = ["שם ישוב", "שם יישוב", "שם_ישוב", "שם_יישוב", "city_name", "CityName"]
name24 = pick_first_existing(df24, city_name_candidates)
name25 = pick_first_existing(df25, city_name_candidates)

if not name24 or not name25:
    raise ValueError("לא נמצאה עמודת 'שם יישוב' בשני הקבצים.")

df24[name24] = df24[name24].astype(str).str.strip()
df25[name25] = df25[name25].astype(str).str.strip()

common_city_names = set(df24[name24]).intersection(set(df25[name25]))

df24_common = df24[df24[name24].isin(common_city_names)].copy()
df25_common = df25[df25[name25].isin(common_city_names)].copy()

df24_common = df24_common.rename(columns={name24: "שם יישוב"})
df25_common = df25_common.rename(columns={name25: "שם יישוב"})

# ---- FIX (critical): sort both datasets by city name to ensure identical order ----
df24_common = df24_common.sort_values("שם יישוב").reset_index(drop=True)
df25_common = df25_common.sort_values("שם יישוב").reset_index(drop=True)

if df24_common.shape != df25_common.shape:
    raise ValueError("Datasets are not of equal size after city-name filtering. Please repeat steps b and c.")

# =========================================
# 4(e): Party composition changes in 2024 to match 2025
# Create NEW columns in 2024 as required
# =========================================

party_mapping_24 = {
    "תקווה חדשה": ["תקווה חדשה", "תקוה חדשה", "ת"],
    "כחול לבן":   ["כחול לבן", "כחול-לבן", "כן"],
    "הרשימה המשותפת": ["הרשימה המשותפת", "רשימה משותפת", "ודעם", "עם"],
    "ימינה":      ["ימינה", "ימינה-בנט", "בנט", "ט"]
}

resolved_24 = column_name_mapping(df24_common, party_mapping_24, strict=True)

df24_aligned = df24_common.copy()

df24_aligned[resolved_24["תקווה חדשה"]] = to_numeric(df24_aligned[resolved_24["תקווה חדשה"]])
df24_aligned[resolved_24["כחול לבן"]]   = to_numeric(df24_aligned[resolved_24["כחול לבן"]])
df24_aligned[resolved_24["הרשימה המשותפת"]] = to_numeric(df24_aligned[resolved_24["הרשימה המשותפת"]])
df24_aligned[resolved_24["ימינה"]]      = to_numeric(df24_aligned[resolved_24["ימינה"]])

df24_aligned["המחנה הממלכתי"] = (
    df24_aligned[resolved_24["תקווה חדשה"]] + df24_aligned[resolved_24["כחול לבן"]]
)
df24_aligned["חדש-תעל"] = 0.4 * df24_aligned[resolved_24["הרשימה המשותפת"]]
df24_aligned["בלד"]     = 0.6 * df24_aligned[resolved_24["הרשימה המשותפת"]]
df24_aligned["הבית היהודי"] = 0.4 * df24_aligned[resolved_24["ימינה"]]
df24_aligned["הציונות הדתית"] = 0.6 * df24_aligned[resolved_24["ימינה"]]

# =========================================
# Drop 2024 source columns used in the formulas
# =========================================

source_cols_24 = [
    resolved_24["תקווה חדשה"],
    resolved_24["כחול לבן"],
    resolved_24["הרשימה המשותפת"],
    resolved_24["ימינה"]
]

df24_clean = df24_aligned.drop(columns=source_cols_24, errors="ignore").copy()
df25_clean = df25_common.copy()

# =========================================
# Build comparable 13-party matrices (1211 x 13)
# Target parties chosen by 2025 share > 1%
# =========================================

non_party_cols_like = {
    "סמל ועדה", "סמל_ועדה", "ועדה", "קלפי", "מספר קלפי",
    "בזב", "מצביעים", "כשרים", "פסולים", "אחוז הצבעה", "אחוז_הצבעה",
    "eligible", "voters", "valid", "invalid", "turnout",
    "סמל ישוב", "סמל יישוב", "שם ישוב", "שם_ישוב", "שם_יישוב", "city_name", "CityName",
    "שם יישוב"
}

def get_party_cols(df):
    num_cols = df.select_dtypes(include=np.number).columns.tolist()
    num_cols = [c for c in num_cols if c not in non_party_cols_like and not str(c).startswith("Unnamed")]
    return num_cols

party25 = get_party_cols(df25_clean)

for c in party25:
    df25_clean[c] = to_numeric(df25_clean[c])

total25 = df25_clean[party25].to_numpy().sum()
share25 = df25_clean[party25].sum(axis=0) / total25

target_parties = sorted([p for p in party25 if share25[p] > 0.01])

if len(target_parties) != 13:
    raise ValueError(f"Expected 13 big parties (>1%) but found {len(target_parties)} in 2025. Check party columns / threshold step.")

for p in target_parties:
    if p not in df24_clean.columns:
        df24_clean[p] = 0

for p in target_parties:
    df24_clean[p] = to_numeric(df24_clean[p])

for p in target_parties:
    if p not in df25_clean.columns:
        raise ValueError(f"Target party '{p}' missing in 2025 dataset. Cannot build comparable matrices.")
    df25_clean[p] = to_numeric(df25_clean[p])

X24 = df24_clean[["שם יישוב"] + target_parties].set_index("שם יישוב").copy()
X25 = df25_clean[["שם יישוב"] + target_parties].set_index("שם יישוב").copy()

if X24.shape != X25.shape:
    raise ValueError(f"Matrices not same shape: X24={X24.shape}, X25={X25.shape}")

if X24.shape[0] != 1211 or X24.shape[1] != 13:
    raise ValueError(f"Unexpected matrix size. Got {X24.shape} (rows, cols). Expected (1211, 13).")

# =========================================
# Save valid votes ("כשרים") separately and standardize (Z)
# =========================================

valid_col_candidates = ["כשרים", "כשר", "valid", "Valid"]

valid24_col = pick_first_existing(df24_common, valid_col_candidates)
valid25_col = pick_first_existing(df25_common, valid_col_candidates)

if not valid24_col or not valid25_col:
    raise ValueError("לא נמצאה עמודת 'כשרים' (valid votes) בשני הקבצים.")

valid24 = to_numeric(df24_common.set_index("שם יישוב")[valid24_col]).reindex(X24.index)
valid25 = to_numeric(df25_common.set_index("שם יישוב")[valid25_col]).reindex(X25.index)

def z_standardize(df: pd.DataFrame) -> pd.DataFrame:
    means = df.mean(axis=0)
    stds = df.std(axis=0, ddof=0).replace(0, 1)
    return (df - means) / stds

X24_z = z_standardize(X24)
X25_z = z_standardize(X25)

# =========================================
# PCA on 2024 (reduce to 2D)
# =========================================

pca_24 = PCA(n_components=2)
X24_pca = pca_24.fit_transform(X24_z)

X24_pca_df = pd.DataFrame(
    X24_pca,
    index=X24_z.index,
    columns=["PC1", "PC2"]
)

explained_variance_24 = pca_24.explained_variance_ratio_

# =========================================
# Loadings plot: party positions on PC1 and PC2 (NO GUI)
# =========================================

pc_loadings = pd.DataFrame(
    pca_24.components_.T,
    index=X24_z.columns,
    columns=["PC1", "PC2"]
)

plt.figure(figsize=(8, 8))
plt.scatter(pc_loadings["PC1"], pc_loadings["PC2"])

for party in pc_loadings.index:
    plt.text(
        pc_loadings.loc[party, "PC1"],
        pc_loadings.loc[party, "PC2"],
        party,
        fontsize=9
    )

plt.axhline(0)
plt.axvline(0)
plt.xlabel("PC1")
plt.ylabel("PC2")
plt.title("PCA Loadings: Parties on PC1 and PC2 (Knesset 24)")
plt.grid(True)

plt.tight_layout()
plt.savefig("pca_loadings_parties_24.png", dpi=200)
plt.close()


# =========================================
# Project both elections (24 & 25) onto the SAME PCA axes
# (PCA fitted ONLY on 2024)
# =========================================

# 2024: already fitted, but we can also transform explicitly
X24_proj = pca_24.transform(X24_z)

# 2025: transform ONLY (no fit!)
X25_proj = pca_24.transform(X25_z)

# Store results as DataFrames
X24_proj_df = pd.DataFrame(
    X24_proj,
    index=X24_z.index,
    columns=["PC1", "PC2"]
)

X25_proj_df = pd.DataFrame(
    X25_proj,
    index=X25_z.index,
    columns=["PC1", "PC2"]
)

import numpy as np
import pandas as pd

# --- Force non-GUI backend (so it works on your machine) ---
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# =========================================================
# Assumes you already have from previous steps:
# - pca_24 fitted on X24_z  (PCA fitted ONLY on 2024)
# - X24_z, X25_z (standardized matrices, index=city, cols=13 parties)
# - valid24, valid25 (Series of valid votes ("כשרים"), indexed by city, aligned to X24/X25)
# =========================================================

# ---------------------------------------------------------
# 1) Project BOTH years onto the SAME PCA axes (fit was on 2024)
# ---------------------------------------------------------
X24_proj = pca_24.transform(X24_z)
X25_proj = pca_24.transform(X25_z)

X24_proj_df = pd.DataFrame(X24_proj, index=X24_z.index, columns=["PC1", "PC2"])
X25_proj_df = pd.DataFrame(X25_proj, index=X25_z.index, columns=["PC1", "PC2"])

# ---------------------------------------------------------
# 2) Normalize sizes based on valid votes (to separate small vs large cities visually)
#    We normalize on BOTH years together for consistent scaling.
# ---------------------------------------------------------
valid_both = pd.concat([valid24.rename("valid24"), valid25.rename("valid25")], axis=1)

# Use max of the two years per city for size (so city size is stable visually)
size_raw = valid_both.max(axis=1)

def minmax_to_range(s: pd.Series, out_min=20, out_max=300) -> pd.Series:
    s = s.astype(float)
    s_min = s.min()
    s_max = s.max()
    if s_max == s_min:
        return pd.Series(out_min, index=s.index)
    return out_min + (s - s_min) * (out_max - out_min) / (s_max - s_min)

sizes = minmax_to_range(size_raw, out_min=20, out_max=300)

# ---------------------------------------------------------
# 3) Build plotting data for both years
# ---------------------------------------------------------
plot24 = X24_proj_df.copy()
plot24["year"] = "24"
plot24["size"] = sizes.reindex(plot24.index)

plot25 = X25_proj_df.copy()
plot25["year"] = "25"
plot25["size"] = sizes.reindex(plot25.index)

# ---------------------------------------------------------
# 4) Create figure: points + arrows (for cities with >=1000 valid votes)
# ---------------------------------------------------------
plt.figure(figsize=(10, 8))

# Points: year 24
plt.scatter(
    plot24["PC1"], plot24["PC2"],
    s=plot24["size"],
    alpha=0.6,
    label="Elections 24"
)

# Points: year 25
plt.scatter(
    plot25["PC1"], plot25["PC2"],
    s=plot25["size"],
    alpha=0.6,
    label="Elections 25"
)

# Axes lines
plt.axhline(0, linewidth=1)
plt.axvline(0, linewidth=1)

# ---------------------------------------------------------
# 5) Arrows: for cities with at least 1000 valid votes
#    Arrow from 24 -> 25 in PC space
# ---------------------------------------------------------
threshold = 1000
big_cities = size_raw[size_raw >= threshold].index

for city in big_cities:
    x0 = X24_proj_df.loc[city, "PC1"]
    y0 = X24_proj_df.loc[city, "PC2"]
    x1 = X25_proj_df.loc[city, "PC1"]
    y1 = X25_proj_df.loc[city, "PC2"]

    dx = x1 - x0
    dy = y1 - y0

    plt.arrow(
        x0, y0, dx, dy,
        length_includes_head=True,
        head_width=0.03,   # you can tweak if too small/large
        head_length=0.04,  # you can tweak if too small/large
        linewidth=0.6,
        alpha=0.5
    )

# Labels and title
plt.xlabel("PC1 (PCA axes from Elections 24)")
plt.ylabel("PC2 (PCA axes from Elections 24)")
plt.title("Projection of Elections 24 & 25 on PCA axes (fit on 24)\nSize ~ valid votes, arrows for cities with >=1000 valid votes")
plt.grid(True)
plt.legend()

# Save to file (since no GUI)
plt.tight_layout()
plt.savefig("pca_projection_24_25_with_arrows.png", dpi=200)
plt.close()
