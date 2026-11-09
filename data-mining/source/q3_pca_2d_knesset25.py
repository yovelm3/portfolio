import pandas as pd
from sklearn.decomposition import PCA
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

df = pd.read_csv("25 - תוצאות לפי קלפיות.csv", encoding="utf-8-sig")
# סעף II
# להוציא מעטפות חיצוניות
df = df[~df["שם ישוב"].astype(str).str.contains("מעטפות")].copy()

print(df.shape)

meta_cols = ['סמל ועדה', 'ברזל', 'שם ישוב', 'סמל ישוב', 'קלפי', 'ריכוז', 'שופט', 'בזב', 'מצביעים', 'פסולים', 'כשרים']
party_cols = [c for c in df.columns if c not in meta_cols]

print("מספר עמודות מפלגות:", len(party_cols))
print("דוגמא שמות מפלגות:", party_cols[:10])

# סך קולות כשרים בכל הקלפיות
tot_valid = df["כשרים"].sum()

# אחוז מכלל הכשרים לכל מפלגה
shares = (df[party_cols].sum() / tot_valid).sort_values(ascending=False)

# לשמור רק מפלגות עם >= 1%
keep = shares[shares >= 0.01].index.tolist()

print("מספר מפלגות שנשארו (>=1%):", len(keep))
print("המפלגות שנשארו:", keep)
print("\nאחוזים (Top 10):")
print((shares.loc[keep].head(10) * 100).round(2))

ballot_party = df.set_index("ברזל")[keep]  # rows=קלפיות, cols=מפלגות

party_by_ballot = ballot_party.T  # rows=מפלגות, cols=קלפיות זה ה-Transpose

X = party_by_ballot.values  # זה מה שנכניס ל-PCA

print("ballot_party rows, cols:", ballot_party.shape[0], ballot_party.shape[1])  # 11707, 13
print("party_by_ballot rows, cols:", party_by_ballot.shape[0], party_by_ballot.shape[1])  # 13, 11707
print("X rows, cols:", X.shape[0], X.shape[1])  # 13, 11707

# Min-Max normalization לכל קלפי (כל עמודה)
"""col_min = party_by_ballot.min(axis=0)
col_max = party_by_ballot.max(axis=0)
den = (col_max - col_min).replace(0, 1)   # למנוע חלוקה באפס אם יש עמודה קבועה

party_by_ballot_mm = (party_by_ballot - col_min).div(den, axis=1)

print("party_by_ballot_mm shape:", party_by_ballot_mm.shape)
print("בדיקה מהירה: מינימום בעמודה לדוגמה =", party_by_ballot_mm.iloc[:, 0].min(),
      "מקסימום =", party_by_ballot_mm.iloc[:, 0].max())

X = party_by_ballot_mm.values"""

# --- Z-Standardization לכל קלפי (כל עמודה) ---
col_mean = party_by_ballot.mean(axis=0)
col_std = party_by_ballot.std(axis=0, ddof=0).replace(0, 1)  # למנוע חלוקה באפס
party_by_ballot_z = (party_by_ballot - col_mean).div(col_std, axis=1)

# בדיקה מהירה: בעמודה לדוגמה mean≈0, std≈1
j = 0
print("Z check (example column): mean=", round(party_by_ballot_z.iloc[:, j].mean(), 4),
      "std=", round(party_by_ballot_z.iloc[:, j].std(ddof=0), 4))

# זו המטריצה שנכניס ל-PCA
X = party_by_ballot_z.values

# הרצת PCA (פעם אחת בלבד)
pca = PCA(n_components=2, random_state=0)
scores = pca.fit_transform(X)          # (13,2)
evr = pca.explained_variance_ratio_
print("Explained variance ratio:", evr)
print("PC1+PC2 explained %:", round(evr.sum()*100, 2))

# ציור גרף + שמות מפלגות
party_name_map = {
    "מחל": "הליכוד",
    "פה": "יש עתיד",
    "ט": "הציונות הדתית",
    "כן": "המחנה הממלכתי",
    "שס": 'ש"ס',
    "ג": "יהדות התורה",
    "ל": "ישראל ביתנו",
    "אמת": "העבודה",
    "מרצ": "מרצ",
    "ום": 'חד"ש–תע"ל',
    "עם": 'הרשימה הערבית המאוחדת',
    "ד": 'בל"ד',
    "ב": "הבית היהודי",
    "ז": "שחר כח חברתי",
}
party_codes = party_by_ballot.index.tolist()
labels = [party_name_map.get(code, code) for code in party_codes]


def reverse_hebrew(s: str) -> str:
    return s[::-1]


plt.figure(figsize=(10, 6))
plt.scatter(scores[:, 0], scores[:, 1])

for (x, y), lab in zip(scores, labels):
    plt.annotate(reverse_hebrew(lab), (x, y),
                 textcoords="offset points", xytext=(5, 5), fontsize=11)

plt.axhline(0, linewidth=0.8)
plt.axvline(0, linewidth=0.8)
plt.title("Knesset 25 — PCA (2D) — Z-Standardized")
plt.xlabel(f"PC1 ({evr[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({evr[1]*100:.1f}%)")
plt.tight_layout()
plt.savefig("pca_k25_z.png", dpi=200, bbox_inches="tight")
plt.close()

# extremes (עם שם מפלגה מלא)
scores_df = pd.DataFrame(scores, index=party_codes, columns=["PC1", "PC2"])
scores_df_named = scores_df.copy()
scores_df_named.index = labels

print("\nPC1 extremes (Z):")
print(scores_df_named["PC1"].sort_values().head(3))
print(scores_df_named["PC1"].sort_values().tail(3))

print("\nPC2 extremes (Z):")
print(scores_df_named["PC2"].sort_values().head(3))
print(scores_df_named["PC2"].sort_values().tail(3))
