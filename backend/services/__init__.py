from backend.services.config import (
    RAW_DATA_PATH,
    CLEANED_DATA_PATH,
    FEATURE_DATA_PATH,
    SEGMENTED_DATA_PATH,
    SCALER_PATH,
    KMEANS_MODEL_PATH
)

from backend.services.data_loader import (
    load_raw_data,
    load_csv_data
)

from backend.services.data_cleaner import (
    impute_missing_income,
    remove_duplicates,
    correct_data_types,
    remove_zero_variance_columns,
    standardize_marital_status,
    remove_outliers,
    clean_dataset
)

from backend.services.feature_engineering import (
    add_age,
    add_customer_tenure,
    add_total_spending,
    add_total_purchases,
    add_average_spending_per_purchase,
    engineer_features
)

from backend.services.customer_segmentation import (
    scale_features,
    train_kmeans,
    assign_clusters,
    run_segmentation_pipeline
)

from backend.services.upload_service import (
    process_and_store_csv
)

from backend.services.customer_service import (
    COHORT_DETAILS,
    get_customers,
    get_customer_by_id,
    predict_segment
)

from backend.services.dashboard_service import (
    get_dashboard_statistics,
    get_clusters_profiles,
    get_cluster_details,
    get_business_insights
)

