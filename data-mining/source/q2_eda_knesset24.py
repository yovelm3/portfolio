# =================================
# Step 0: Import libraries
# =================================
import pandas as pd
import numpy as np

# =================================
# Pandas display settings
# =================================
pd.set_option('display.max_columns', 5)

# =================================
# Step 1: Load datasets
# =================================
df24_city = pd.read_excel("24_city.xlsx")
df24_kalpi = pd.read_excel("24_kalpi.xlsx")

# =================================
# b.i Use only 2024 Kalpi data
# Remove "external envelopes"
# =================================
mask_external_24 = df24_kalpi.astype(str).apply(
    lambda row: row.str.contains("מעטפות", regex=False).any(),
    axis=1
)

df24_kalpi = df24_kalpi[~mask_external_24]

# =================================
# b.ii Keep only parties with >1% of total votes
# (robust identification of party columns)
# =================================

# Administrative (non-party) columns (adjust if your file differs)
non_party_cols_24 = ['ברזל', 'סמל ישוב', 'קלפי', 'בזב', 'מצביעים', 'כשרים']

# Party columns = not administrative AND numeric
party_cols_24 = [
    col for col in df24_kalpi.columns
    if col not in non_party_cols_24
    and pd.api.types.is_numeric_dtype(df24_kalpi[col])
]

# Votes only
df_votes_24 = df24_kalpi[party_cols_24]

# Party vote shares
party_totals_24 = df_votes_24.sum()
party_percentages_24 = party_totals_24 / party_totals_24.sum()

# Keep parties with more than 1%
major_parties_24 = party_percentages_24[party_percentages_24 > 0.01].index

# Final cleaned dataset (only major parties)
df24_kalpi = df24_kalpi[major_parties_24]

# =================================
# Temporary output – parties kept
# (for b.iii mapping, can be removed later)
# =================================
print(list(df24_kalpi.columns))

# =================================
# b.iii Remove non-party columns and
# replace party codes with full names
# =================================

# Remove remaining non-party columns (if exist)
df24_kalpi = df24_kalpi.drop(columns=['סמל ועדה', 'ריכוז'], errors='ignore')

# Mapping from official party codes to full party names (Knesset 24)
# NOTE: update names if your course requires exact official names
# Mapping from official party codes to full party names (Knesset 24)
party_name_map_24 = {
    'אמת': 'העבודה',
    'ב': 'הבית היהודי',
    'ג': 'יהדות התורה',
    'ד': 'הציונות הדתית',
    'ום': 'עוצמה יהודית',
    'כן': 'כחול לבן',
    'ל': 'ישראל ביתנו',
    'מחל': 'הליכוד',
    'מרצ': 'מרצ',
    'עם': 'רע״ם',
    'פה': 'יש עתיד',
    'שס': 'ש״ס',

    # ===== parties that were missing =====
    'ת': 'תקווה חדשה',
    'ט': 'ימינה',
    'ודעם': 'הרשימה המשותפת'
}

# Rename columns (only those that appear in the data)
df24_kalpi = df24_kalpi.rename(columns=party_name_map_24)

# =================================
# b.iv Describe the resulting dataset
# =================================

# Dataset size (rows, columns)
dataset_shape_24 = df24_kalpi.shape
print("Dataset shape:", dataset_shape_24)

# Data types of variables
data_types_24 = df24_kalpi.dtypes
print("Data types:\n", data_types_24)

# Check for missing values
missing_values_24 = df24_kalpi.isnull().sum()
print("Missing values:\n", missing_values_24)

# =================================
# b.v Exploratory Data Analysis (EDA)
# =================================

import matplotlib.pyplot as plt
import seaborn as sns

# ---------------------------------
# 1. Descriptive statistics
# ---------------------------------
eda_describe_24 = df24_kalpi.describe()
print(eda_describe_24)

# ---------------------------------
# 2. Pairplot (scatter matrix)
# ---------------------------------
# pair_plot_24 = sns.pairplot(df24_kalpi)
#
# pair_plot_24.fig.suptitle(
#     'Pairplot – תרשימי פיזור בין קטגוריות הצבעה (בחירות לכנסת ה־24)',
#     y=1.02
# )
#
# # plt.show()

# ---------------------------------
# 3. Correlation matrix visualization (optional)
# ---------------------------------
corr_matrix_24 = df24_kalpi.corr()

plt.figure(figsize=(10, 8))
plt.matshow(corr_matrix_24, fignum=1)
plt.colorbar()
plt.xticks(range(len(corr_matrix_24.columns)), corr_matrix_24.columns, rotation=90)
plt.yticks(range(len(corr_matrix_24.columns)), corr_matrix_24.columns)
plt.title("Correlation Matrix – 2024 Kalpi Data", pad=20)
plt.show()
