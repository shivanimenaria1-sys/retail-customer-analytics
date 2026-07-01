import pandas as pd
import numpy as np
from pathlib import Path
from typing import Union, Tuple
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import joblib
import os
from backend.services.config import (
    CLUSTERING_FEATURES,
    N_CLUSTERS,
    RANDOM_STATE,
    SCALER_PATH,
    KMEANS_MODEL_PATH
)

def scale_features(
    df: pd.DataFrame, 
    features: list = CLUSTERING_FEATURES, 
    save_path: Union[str, Path] = None
) -> Tuple[np.ndarray, StandardScaler]:
    """
    Standardizes selected features using StandardScaler.

    Args:
        df (pd.DataFrame): Input customer DataFrame containing selected features.
        features (list): List of columns to scale. Defaults to CLUSTERING_FEATURES.
        save_path (Union[str, Path]): Optional path to save the fitted StandardScaler object. Defaults to None.

    Returns:
        Tuple[np.ndarray, StandardScaler]: Scaled array of features and the fitted scaler object.
    """
    X = df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    if save_path:
        path = Path(save_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(scaler, path)
        
    return X_scaled, scaler

def train_kmeans(
    X_scaled: np.ndarray, 
    n_clusters: int = N_CLUSTERS, 
    random_state: int = RANDOM_STATE, 
    save_path: Union[str, Path] = None
) -> KMeans:
    """
    Trains a KMeans clustering model.

    Args:
        X_scaled (np.ndarray): Scaled feature matrix.
        n_clusters (int): Number of clusters. Defaults to N_CLUSTERS (4).
        random_state (int): Random state seed. Defaults to RANDOM_STATE (42).
        save_path (Union[str, Path]): Optional path to save the fitted KMeans model. Defaults to None.

    Returns:
        KMeans: Fitted KMeans model.
    """
    kmeans_model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    kmeans_model.fit(X_scaled)
    
    if save_path:
        path = Path(save_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(kmeans_model, path)
        
    return kmeans_model

def assign_clusters(df: pd.DataFrame, X_scaled: np.ndarray, model: KMeans) -> pd.DataFrame:
    """
    Predicts clusters and adds labels along with 2D PCA coordinates (PC1, PC2) to the customer DataFrame.

    Args:
        df (pd.DataFrame): Input customer DataFrame.
        X_scaled (np.ndarray): Scaled feature matrix.
        model (KMeans): Trained KMeans model.

    Returns:
        pd.DataFrame: DataFrame with Cluster, PC1, and PC2 columns added.
    """
    df_copy = df.copy()
    
    # Assign cluster labels
    df_copy['Cluster'] = model.predict(X_scaled)
    
    # Add PCA projections
    pca = PCA(n_components=2, random_state=42)
    pca_comps = pca.fit_transform(X_scaled)
    df_copy['PC1'] = pca_comps[:, 0]
    df_copy['PC2'] = pca_comps[:, 1]
    
    return df_copy

def run_segmentation_pipeline(
    df: pd.DataFrame, 
    save_models: bool = True,
    scaler_path: Union[str, Path] = SCALER_PATH,
    kmeans_path: Union[str, Path] = KMEANS_MODEL_PATH
) -> pd.DataFrame:
    """
    Orchestrates the entire customer segmentation pipeline: scaling, modeling, PCA, labeling, and serialization.

    Args:
        df (pd.DataFrame): Feature-engineered customer DataFrame.
        save_models (bool): If True, serializes scaler and kmeans_model. Defaults to True.
        scaler_path (Union[str, Path]): Save path for StandardScaler. Defaults to SCALER_PATH.
        kmeans_path (Union[str, Path]): Save path for KMeans model. Defaults to KMEANS_MODEL_PATH.

    Returns:
        pd.DataFrame: Segmented customer DataFrame.
    """
    df_copy = df.copy()
    
    s_path = scaler_path if save_models else None
    k_path = kmeans_path if save_models else None
    
    # Scale
    X_scaled, scaler = scale_features(df_copy, save_path=s_path)
    
    # Train K-Means
    model = train_kmeans(X_scaled, save_path=k_path)
    
    # Assign Cluster Labels and PCA projections
    segmented_df = assign_clusters(df_copy, X_scaled, model)
    
    return segmented_df
