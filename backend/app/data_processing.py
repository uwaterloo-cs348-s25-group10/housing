import pandas as pd

def process_region_csv():
    print("Processing region CSV...")

    df = pd.read_csv("rawdata/region.csv")
    print("{len(df)} rows in region.csv")

    df = df.dropna()

    df['name'] = df['name'].str.strip()
    df['province'] = df['name'].str.strip()

    df = df.drop_duplicates(subset=['name', 'province'])

    print("{len(df)} rows in region.csv")

    print(df.head())