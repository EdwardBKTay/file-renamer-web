import JSZip from 'jszip'
import Papa from 'papaparse'
import './App.css'
import { useState } from 'react';

function App() {
  const [renamedFileList, setRenamedFileList] = useState<{[key: string]: string;}>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<FileList | null>(null);

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const csvFile: File | null = event.target.files?.[0] ?? null;
    setCsvFile(csvFile);
  }

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const folder: FileList | null = event.target.files;
    setFolder(folder);
  }

  if (csvFile) {
    Papa.parse(csvFile, {
      complete: (result) => {
        const data: {[key: string]: string;} = {};
        const rows = result.data as string[];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.length == 2) {
            const oldName: string = row[0].trim();
            const newName: string = row[1].trim();

            if (Object.prototype.hasOwnProperty.call(data, oldName)) {
              alert("Duplicate file names in CSV file");
              return;
            }

            data[oldName] = newName;
          } else {
            alert("Invalid CSV file format");
            return;
          }
        }
        setRenamedFileList(data);
      }
    })
  }

  const downloadFiles = () => {
    const zip = new JSZip();
    const timestamp: string = new Date().toISOString().replace(/[-:.]/g, "");
    zip.support

    if (folder) {
      for (let i = 0; i < folder.length; i++) {
        const file = folder[i];
        const oldName: string = file.name;
        const newName: string = renamedFileList[oldName];
        zip.file(newName, file);
      }

      zip.generateAsync({type: "blob"}).then(function(content: Blob) {
        const downloadLink: HTMLAnchorElement = document.createElement("a");
        downloadLink.href = URL.createObjectURL(new Blob([content]));
        downloadLink.download = timestamp + ".zip";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
    }
  }

  return (
    <>
      <h1>File Renaming Website</h1>
      <div>
        <label htmlFor='csvInput'>Upload CSV File: </label>
        <input type="file" id="csvInput" accept='.csv' onChange={handleCsvFileChange}/>
      </div>
      <div>
        <label htmlFor='folderInput'>Upload Folder: </label>
        <input type="file" id="folderInput" webkitdirectory="true" multiple directory onChange={handleFolderChange}/>
      </div>
      {folder?.length && <div id="fileList">
        <table>
          <thead>
            <tr>
              <th>Index</th>
              <th>Old File Name</th>
              <th>New File Name</th>
            </tr>
          </thead>
          <tbody>
            {
              folder && Array.from(folder).map((file, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{file.name}</td>
                    <td>{renamedFileList[file.name]}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <button onClick={downloadFiles}>Download All</button>
      </div>}
    </>
  )
}

export default App
