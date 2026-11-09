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

df25_city = pd.read_excel("25_city.xlsx")
df25_kalpi = pd.read_excel("25_kalpi.xlsx")

# =================================
# b.i Use only 2025 Kalpi data
# Remove "external envelopes"
# =================================
mask_external = df25_kalpi.astype(str).apply(
    lambda row: row.str.contains("מעטפות", regex=False).any(),
    axis=1
)

df25_kalpi = df25_kalpi[~mask_external]

# =================================
# b.ii Keep only parties with >1% of total votes
# (robust identification of party columns)
# =================================

# Administrative (non-party) columns
non_party_cols = ['ברזל', 'סמל ישוב', 'קלפי', 'בזב', 'מצביעים', 'כשרים']

# Party columns = not administrative AND numeric
party_cols = [
    col for col in df25_kalpi.columns
    if col not in non_party_cols
    and pd.api.types.is_numeric_dtype(df25_kalpi[col])
]

# Votes only
df_votes = df25_kalpi[party_cols]

# Party vote shares
party_totals = df_votes.sum()
party_percentages = party_totals / party_totals.sum()

# Keep parties with more than 1%
major_parties = party_percentages[party_percentages > 0.01].index

# Final cleaned dataset (only major parties)
df25_kalpi = df25_kalpi[major_parties]

# =================================
# Temporary output – parties kept
# (for b.iii mapping, can be removed later)
# =================================
print(list(df25_kalpi.columns))

# =================================
# b.iii Remove non-party columns and
# replace party codes with full names
# =================================

# Remove remaining non-party columns
df25_kalpi = df25_kalpi.drop(columns=['סמל ועדה', 'ריכוז'], errors='ignore')

# Mapping from official party codes to full party names
party_name_map = {
    'אמת': 'העבודה',
    'ב': 'הבית היהודי',
    'ג': 'יהדות התורה',
    'ד': 'הציונות הדתית',
    'ום': 'עוצמה יהודית',
    'ט': 'הציונות הדתית ועוצמה יהודית',
    'כן': 'כחול לבן',
    'ל': 'ישראל ביתנו',
    'מחל': 'הליכוד',
    'מרצ': 'מרצ',
    'עם': 'רע״ם',
    'פה': 'יש עתיד',
    'שס': 'ש״ס'
}

# Rename columns (only those that appear in the data)
df25_kalpi = df25_kalpi.rename(columns=party_name_map)

# =================================
# b.iv Describe the resulting dataset
# =================================

# Dataset size (rows, columns)
dataset_shape = df25_kalpi.shape
print("Dataset shape:", dataset_shape)

# Data types of variables
data_types = df25_kalpi.dtypes
print("Data types:\n", data_types)

# Check for missing values
missing_values = df25_kalpi.isnull().sum()
print("Missing values:\n", missing_values)

# =================================
# b.v Exploratory Data Analysis (EDA)
# =================================

import matplotlib.pyplot as plt
import seaborn as sns

# ---------------------------------
# 1. Descriptive statistics
# ---------------------------------
eda_describe = df25_kalpi.describe()
print(eda_describe)

pair_plot = sns.pairplot(df25_kalpi)

pair_plot.fig.suptitle(
    'Pairplot – תרשימי פיזור בין קטגוריות הצבעה (בחירות לכנסת ה־25)',
    y=1.02
)

plt.show()
# ---------------------------------
# 3. Correlation matrix visualization
# ---------------------------------
# corr_matrix = df25_kalpi.corr()
#
# plt.figure(figsize=(10, 8))
# plt.matshow(corr_matrix, fignum=1)
# plt.colorbar()
# plt.xticks(range(len(corr_matrix.columns)), corr_matrix.columns, rotation=90)
# plt.yticks(range(len(corr_matrix.columns)), corr_matrix.columns)
# plt.title("Correlation Matrix – 2025 Kalpi Data", pad=20)
# plt.show()
