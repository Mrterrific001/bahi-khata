import { Business } from '../types';
import { reviveDates } from './db';

export const exportData = (data: any, filename: string) => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importDataFromFile = (file: File, callback: (data: Business[]) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
      try {
          const result = e.target?.result as string;
          const parsedData = JSON.parse(result);
          const data = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          // Revive dates before importing and tag as new
          const revived = reviveDates(data).map((b: any) => ({
              ...b,
              id: b.id || crypto.randomUUID(),
              isNew: true
          }));
          
          callback(revived);
      } catch(e) { 
        alert("Error importing file. Please check the format."); 
        console.error(e);
      }
  };
  reader.readAsText(file);
};