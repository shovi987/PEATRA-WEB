import os
import zipfile

def build_project_zip():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_zip = os.path.join(os.path.dirname(base_dir), "peatra_streamlit_app.zip")
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith('.pyc') or '__pycache__' in root:
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname)
                
    print(f"Zip created successfully at: {output_zip} ({os.path.getsize(output_zip):,} bytes)")

if __name__ == '__main__':
    build_project_zip()
