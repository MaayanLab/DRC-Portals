from frictionless import Package, Table
import os
import pandas as pd
import psycopg2
from sqlalchemy import create_engine



package = Package('C2M2_datapackage.json')
package.publish('postgresql://database')