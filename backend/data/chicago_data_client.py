"""
Client for fetching data from Chicago Data Portal
"""

import os
import requests
import pandas as pd
from typing import Optional, Dict, List


class ChicagoDataClient:
    """Client for interacting with Chicago Data Portal API"""

    def __init__(self):
        """Initialize Chicago Data client"""
        self.api_key = os.getenv('CHICAGO_DATA_API_KEY')
        self.base_url = os.getenv('CHICAGO_DATA_BASE_URL', 'https://data.cityofchicago.org/resource/')

        self.datasets = {
            'housing': os.getenv('AFFORDABLE_HOUSING_DATASET_ID'),
            'crime': os.getenv('CRIME_DATASET_ID'),
            'calls_311': os.getenv('CALLS_311_DATASET_ID')
        }

    def fetch_data(self, dataset_type: str, filters: Optional[Dict] = None, limit: int = 1000) -> pd.DataFrame:
        """
        Fetch data from a specific dataset

        Args:
            dataset_type: Type of dataset ('housing', 'crime', 'calls_311')
            filters: Optional filters to apply
            limit: Maximum number of records

        Returns:
            DataFrame containing the fetched data
        """
        dataset_id = self.datasets.get(dataset_type)
        if not dataset_id:
            raise ValueError(f"Unknown dataset type: {dataset_type}")

        url = f"{self.base_url}{dataset_id}.json"
        params = {'$limit': limit}

        if self.api_key:
            params['$$app_token'] = self.api_key

        if filters:
            # Add SoQL filters
            params.update(filters)

        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        return pd.DataFrame(data)

    def get_housing_by_neighborhood(self, neighborhood: str) -> List[Dict]:
        """Get affordable housing options in a neighborhood"""
        # TODO: Implement neighborhood filtering
        df = self.fetch_data('housing')
        return df.to_dict('records')

    def get_crime_stats(self, neighborhood: str) -> Dict:
        """Get crime statistics for a neighborhood"""
        # TODO: Implement crime aggregation
        df = self.fetch_data('crime')
        return {}

    def get_311_calls(self, neighborhood: str) -> List[Dict]:
        """Get 311 service calls for a neighborhood"""
        # TODO: Implement 311 call filtering
        df = self.fetch_data('calls_311')
        return df.to_dict('records')
