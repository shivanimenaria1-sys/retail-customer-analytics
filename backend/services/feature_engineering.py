import pandas as pd
import numpy as np
from typing import List
from backend.services.config import (
    REFERENCE_YEAR,
    SPENDING_COLUMNS,
    PURCHASE_COLUMNS
)

def add_age(df: pd.DataFrame, reference_year: int = REFERENCE_YEAR) -> pd.DataFrame:
    """
    Calculates customer Age relative to the data collection reference year.

    Args:
        df (pd.DataFrame): Input customer DataFrame.
        reference_year (int): Reference year for data collection. Defaults to REFERENCE_YEAR (2014).

    Returns:
        pd.DataFrame: DataFrame with the engineered Age column.
    """
    df_copy = df.copy()
    df_copy['Age'] = reference_year - df_copy['Year_Birth']
    return df_copy

def add_customer_tenure(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates customer tenure in days relative to the maximum signup date in the dataset.

    Args:
        df (pd.DataFrame): Input customer DataFrame (must have Dt_Customer as datetime).

    Returns:
        pd.DataFrame: DataFrame with the engineered Customer_Tenure column.
    """
    df_copy = df.copy()
    # Make sure Dt_Customer is datetime format
    if not np.issubdtype(df_copy['Dt_Customer'].dtype, np.datetime64):
        df_copy['Dt_Customer'] = pd.to_datetime(df_copy['Dt_Customer'])
    
    reference_date = df_copy['Dt_Customer'].max()
    df_copy['Customer_Tenure'] = (reference_date - df_copy['Dt_Customer']).dt.days
    return df_copy

def add_total_spending(df: pd.DataFrame, spending_cols: List[str] = SPENDING_COLUMNS) -> pd.DataFrame:
    """
    Calculates total spending across all product categories.

    Args:
        df (pd.DataFrame): Input customer DataFrame.
        spending_cols (List[str]): List of spending columns. Defaults to SPENDING_COLUMNS.

    Returns:
        pd.DataFrame: DataFrame with the engineered Total_Spending column.
    """
    df_copy = df.copy()
    df_copy['Total_Spending'] = df_copy[spending_cols].sum(axis=1)
    return df_copy

def add_total_purchases(df: pd.DataFrame, purchase_cols: List[str] = PURCHASE_COLUMNS) -> pd.DataFrame:
    """
    Calculates total purchases across all sales channels.

    Args:
        df (pd.DataFrame): Input customer DataFrame.
        purchase_cols (List[str]): List of purchase columns. Defaults to PURCHASE_COLUMNS.

    Returns:
        pd.DataFrame: DataFrame with the engineered Total_Purchases column.
    """
    df_copy = df.copy()
    df_copy['Total_Purchases'] = df_copy[purchase_cols].sum(axis=1)
    return df_copy

def add_average_spending_per_purchase(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates average spending per purchase (average cart value), safeguarding against division by zero.

    Args:
        df (pd.DataFrame): Input customer DataFrame (must have Total_Spending and Total_Purchases columns).

    Returns:
        pd.DataFrame: DataFrame with the engineered Average_Spending_Per_Purchase column.
    """
    df_copy = df.copy()
    df_copy['Average_Spending_Per_Purchase'] = np.where(
        df_copy['Total_Purchases'] > 0,
        df_copy['Total_Spending'] / df_copy['Total_Purchases'],
        0.0
    )
    return df_copy

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Orchestrates the entire feature engineering pipeline.

    Args:
        df (pd.DataFrame): Cleaned customer DataFrame.

    Returns:
        pd.DataFrame: Feature-engineered customer DataFrame.
    """
    engineered_df = df.copy()
    engineered_df = add_age(engineered_df)
    engineered_df = add_customer_tenure(engineered_df)
    engineered_df = add_total_spending(engineered_df)
    engineered_df = add_total_purchases(engineered_df)
    engineered_df = add_average_spending_per_purchase(engineered_df)
    return engineered_df
