import pandas as pd
from typing import Dict
from backend.services.config import (
    BIRTH_YEAR_OUTLIER_THRESHOLD,
    INCOME_OUTLIER_THRESHOLD,
    MARITAL_STATUS_MAPPING
)

def impute_missing_income(df: pd.DataFrame) -> pd.DataFrame:
    """
    Imputes missing Income values using the median income of the customer's respective Education level.

    Args:
        df (pd.DataFrame): Input customer DataFrame.

    Returns:
        pd.DataFrame: DataFrame with imputed Income values.
    """
    df_copy = df.copy()
    df_copy['Income'] = df_copy.groupby('Education')['Income'].transform(lambda x: x.fillna(x.median()))
    return df_copy

def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Removes duplicate records from the DataFrame.

    Args:
        df (pd.DataFrame): Input customer DataFrame.

    Returns:
        pd.DataFrame: DataFrame with duplicates removed.
    """
    return df.drop_duplicates()

def correct_data_types(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converts Dt_Customer column to datetime64 format.

    Args:
        df (pd.DataFrame): Input customer DataFrame.

    Returns:
        pd.DataFrame: DataFrame with corrected data types.
    """
    df_copy = df.copy()
    df_copy['Dt_Customer'] = pd.to_datetime(df_copy['Dt_Customer'])
    return df_copy

def remove_zero_variance_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Removes pre-defined columns with zero variance (constant columns like Z_CostContact and Z_Revenue).

    Args:
        df (pd.DataFrame): Input customer DataFrame.

    Returns:
        pd.DataFrame: DataFrame with zero-variance columns dropped.
    """
    df_copy = df.copy()
    constant_cols = [col for col in ['Z_CostContact', 'Z_Revenue'] if col in df_copy.columns]
    return df_copy.drop(columns=constant_cols)


def standardize_marital_status(df: pd.DataFrame, mapping: Dict[str, str] = MARITAL_STATUS_MAPPING) -> pd.DataFrame:
    """
    Standardizes anomalous marital status values (Alone, Absurd, YOLO) to 'Single'.

    Args:
        df (pd.DataFrame): Input customer DataFrame.
        mapping (Dict[str, str]): Mapping dict for replacement. Defaults to MARITAL_STATUS_MAPPING.

    Returns:
        pd.DataFrame: DataFrame with standardized marital status.
    """
    df_copy = df.copy()
    df_copy['Marital_Status'] = df_copy['Marital_Status'].replace(mapping)
    return df_copy

def remove_outliers(
    df: pd.DataFrame, 
    birth_threshold: int = BIRTH_YEAR_OUTLIER_THRESHOLD, 
    income_threshold: float = INCOME_OUTLIER_THRESHOLD
) -> pd.DataFrame:
    """
    Removes extreme outliers: customers born before birth_threshold or having income greater than income_threshold.

    Args:
        df (pd.DataFrame): Input customer DataFrame.
        birth_threshold (int): Birth year threshold. Defaults to BIRTH_YEAR_OUTLIER_THRESHOLD (1940).
        income_threshold (float): Income threshold. Defaults to INCOME_OUTLIER_THRESHOLD (600,000.0).

    Returns:
        pd.DataFrame: DataFrame with outliers removed.
    """
    df_copy = df.copy()
    # Filter birth year
    df_copy = df_copy[df_copy['Year_Birth'] >= birth_threshold]
    # Filter income
    df_copy = df_copy[df_copy['Income'] <= income_threshold]
    return df_copy

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Orchestrates the entire cleaning pipeline sequentially on a copy of the input dataset.

    Args:
        df (pd.DataFrame): Raw customer DataFrame.

    Returns:
        pd.DataFrame: Cleaned customer DataFrame.
    """
    cleaned_df = df.copy()
    cleaned_df = impute_missing_income(cleaned_df)
    cleaned_df = remove_duplicates(cleaned_df)
    cleaned_df = correct_data_types(cleaned_df)
    cleaned_df = remove_zero_variance_columns(cleaned_df)
    cleaned_df = standardize_marital_status(cleaned_df)
    cleaned_df = remove_outliers(cleaned_df)
    return cleaned_df
