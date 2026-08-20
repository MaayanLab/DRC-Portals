@echo off
:: File to save the results
set outputFile=hashes_external_CV_ref.txt

:: Directory containing files
set directory=external_CV_reference_files_202412

:: Clear existing output file
if exist "%outputFile%" del "%outputFile%"

:: Loop over each file in the directory
for %%f in ("%directory%\*.*") do (
    :: Run certutil to compute the hash
    certutil -hashfile "%%f" MD5 >> "%outputFile%"
)

echo Hashes written to %outputFile%
