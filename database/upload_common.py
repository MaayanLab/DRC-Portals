import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv('../../drc-portals/.env')
load_dotenv()

def upload_file(file_name, object_name=None):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = os.path.basename(file_name)

    # Upload the file
    s3_client = boto3.client('s3',
      endpoint_url=os.getenv('S3_ENDPOINT'),
      region_name=os.getenv('S3_REGION'),
      aws_access_key_id=os.getenv('S3_ACCESS_KEY'),
      aws_secret_access_key=os.getenv('S3_SECRET_KEY'),
    )
    try:
        response = s3_client.upload_file(file_name, os.getenv('S3_BUCKET'), object_name)
    except ClientError as e:
        print(e)
        return False
    return True
