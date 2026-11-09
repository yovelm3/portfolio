import pandas as pd
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# 1. טעינת הנתונים
df = pd.read_csv('data2024.csv', encoding='iso-8859-8', low_memory=False)

# 2. בחירת עמודות המפלגות (מעמודה 11 ועד הסוף)
party_cols = df.columns[11:]
data_parties = df[party_cols].fillna(0)

# 3. *** התיקון הקריטי: טרנספורמציה (Transpose) ***
# אנחנו רוצים שהמפלגות יהיו ה-Rows והקלפיות יהיו ה-Features
data_for_pca = data_parties.T

# 4. נורמליזציה Z-score (על המפלגות)
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data_for_pca)

# 5. PCA ל-3 מימדים
pca = PCA(n_components=3)
pca_results = pca.fit_transform(data_scaled)

# יצירת DataFrame לתוצאות עם שמות המפלגות
pca_df = pd.DataFrame(pca_results, columns=['PC1', 'PC2', 'PC3'], index=party_cols)

# --- תצוגה גרפית של 3 גרפים דו-מימדיים ---
fig, axs = plt.subplots(1, 3, figsize=(18, 6))
pairs = [('PC1', 'PC2'), ('PC1', 'PC3'), ('PC2', 'PC3')]

for i, (x_col, y_col) in enumerate(pairs):
    axs[i].scatter(pca_df[x_col], pca_df[y_col], color='red', s=50)

    # הוספת שמות המפלגות ליד הנקודות (כמו בתמונה שלך)
    for party_name, row in pca_df.iterrows():
        # ניקוי השם כדי שיוצג נכון בעברית
        clean_name = party_name[::-1]  # הופך את הטקסט כדי שיוצג תקין בגרף אם צריך
        axs[i].annotate(clean_name, (row[x_col], row[y_col]), fontsize=9, alpha=0.7)

    axs[i].set_title(f'{x_col} vs {y_col}')
    axs[i].grid(True)

plt.tight_layout()
plt.show()

# --- גרף תלת מימדי ---
fig_3d = plt.figure(figsize=(10, 8))
ax = fig_3d.add_subplot(111, projection='3d')
ax.scatter(pca_df['PC1'], pca_df['PC2'], pca_df['PC3'], c='red', s=60)

for party_name, row in pca_df.iterrows():
    ax.text(row['PC1'], row['PC2'], row['PC3'], party_name[::-1], fontsize=8)

ax.set_title('3D Party Representation (2024)')
plt.show()