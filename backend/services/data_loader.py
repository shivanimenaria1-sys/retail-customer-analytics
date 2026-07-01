import pandas as pd
from pathlib import Path
from typing import Union
from backend.services.config import RAW_DATA_PATH

def load_raw_data(file_path: Union[str, Path] = RAW_DATA_PATH) -> pd.DataFrame:
    """
    Loads the raw retail customer analytics Excel dataset.

    Args:
        file_path (Union[str, Path]): Path to the raw Excel dataset. Defaults to RAW_DATA_PATH.

    Returns:
        pd.DataFrame: The loaded raw customer dataset.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Raw data file not found at: {path.absolute()}")
    return pd.read_excel(path)

def load_csv_data(file_path: Union[str, Path]) -> pd.DataFrame:
    """
    Loads customer records from a CSV file.

    Args:
        file_path (Union[str, Path]): Path to the CSV dataset.

    Returns:
        pd.DataFrame: The loaded CSV customer dataset.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV data file not found at: {path.absolute()}")
    return pd.read_csv(path)
