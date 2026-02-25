"""
train_model.py — Treina o modelo NaiveBayes corretamente e salva em models/
Corrige o bug original onde se salvava a CLASSE em vez do modelo treinado.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Carregar dados
dados = pd.read_csv("Crop_recommendation.csv")

# Features e Target
features = dados[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
target = dados["label"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    features, target, test_size=0.2, random_state=42
)

# Treinar NaiveBayes
modelo = GaussianNB()
modelo.fit(X_train, y_train)

# Avaliar
previsoes = modelo.predict(X_test)
acuracia = accuracy_score(y_test, previsoes)
print(f"Acurácia do NaiveBayes: {acuracia:.4f}")
print(f"\nRelatório de Classificação:\n")
print(classification_report(y_test, previsoes))


os.makedirs("models", exist_ok=True)
joblib.dump(modelo, "models/NAIVEBAYES.pkl")
print("Modelo salvo em models/NAIVEBAYES.pkl")

# Salvar lista de culturas para referência
culturas = sorted(target.unique().tolist())
joblib.dump(culturas, "models/culturas_labels.pkl")
print(f"Labels salvas: {culturas}")
