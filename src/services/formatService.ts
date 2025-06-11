// // src/services/formatServices.ts

// import { User } from "@/types";

// export interface Format {
//   id: string;
//   name: string;
//   uploadDate: string;
//   uploadedBy: string;
//   downloadUrl: string;
// }

// const API_URL = 'https://portal.army.idf/sites/schedule/DB/';
// const STORAGE_KEY = 'formats';
// const isDevelopment = import.meta.env.DEV;

// export const formatService = {
//   getFormats(): Promise<Format[]> {
//     if (isDevelopment) {
//       const storedFormats = localStorage.getItem(STORAGE_KEY);
//       return Promise.resolve(storedFormats ? JSON.parse(storedFormats) : []);
//     }

//     return fetch(`${API_URL}SW%5Sen/schedules/_api/web/lists/getbytitle('formats')/items`, {
//       headers: {
//         accept: 'application/json;odata=verbose',
//       },
//       credentials: 'include',
//     })
//       .then((response) => {
//         if (!response.ok) throw new Error('Failed to fetch formats');
//         console.log("getFormats() response:", response);
//         return response.json();
//       })
//       .then((res) => {
//         console.log("res.json", res);
//         const items = res?.d?.results || [];
//         return items.map((item: any) => ({
//           id: item.Id,
//           name: item.Title,
//           uploadDate: item.Modified,
//           uploadedBy: item.Editor.Title,
//           downloadUrl: item.EncodedAbsUrl,
//         }));
//       });
//   },

//   async uploadFormat(file: File, name: string, user: User, SW: any): Promise<Format> {
//     if (isDevelopment) {
//       const formats = await this.getFormats();
//       const newFormat: Format = {
//         id: Date.now().toString(),
//         name,
//         uploadDate: new Date().toISOString(),
//         uploadedBy: user.name || '', // In development, we'll just use a static name
//         downloadUrl: URL.createObjectURL(file), // Create a local URL for the file
//       };
//       console.log("#newFormat", newFormat);
//       const updatedFormats = [...formats, newFormat];
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
//       return newFormat;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     // Getting the Request Digest
//     const contextInfo = await fetch(`https://portal.army.idf/sites/schedule/_api/contextinfo`, {
//       method: "POST",
//       headers: {
//         accept: "application/json;odata=verbose",
//         "Content-Type": "application/json;odata=verbose",
//       },
//       credentials: "include",
//     });

//     const contextData = await contextInfo.json();
//     const digest = contextData.d.GetContextWebInformation.FormDigestValue;

//     const encodedFileName = encodeURIComponent(file.name);
//     const folderName = `/sites/schedule/DB/SW-${SW.englishName}/formats`;
//     const uploadUrl = `${folderName}/Files/add(url='${encodedFileName}', overwrite=true)`;

//     const uploadRes = await fetch(uploadUrl, {
//       method: "POST",
//       headers: {
//         "X-RequestDigest": digest,
//         "Content-Type": "application/json;odata=verbose",
//         accept: "application/json;odata=verbose",
//       },
//       body: file,
//     });

//     if (!uploadRes.ok) {
//       console.error("upload failed", uploadRes);
//       throw new Error("upload failed");
//     }

//     const downloadUrl = `https://portal.army.idf/sites/schedule/DB/SW-${SW.englishName}/formats/${encodedFileName}`;
//     return {
//       id: user?.id || crypto.randomUUID(), // אם אין מזהה נשתמש ברנדום
//       name,
//       uploadDate: new Date().toISOString(),
//       uploadedBy: user.name,
//       downloadUrl: URL.createObjectURL(file),
//     };
//   },

//   async deleteFormat(id: string, SW: any): Promise<void> {
//     if (isDevelopment) {
//       const formats = await this.getFormats();
//       const updatedFormats = formats.filter((format) => format.id !== id);
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
//       return;
//     }

//     const response = await fetch(`${API_URL}SW%5Sen/schedules/_api/web/lists/getbytitle('formats')/items('${id}')`, {
//       method: "DELETE",
//     });

//     if (!response.ok) throw new Error("Failed to delete format");
//   },
// };






// src/services/formatServices.ts

import { User } from "@/types";

export interface Format {
  id: string;
  name: string;
  uploadDate: string;
  uploadedBy: string;
  downloadUrl: string;
}

const API_URL = 'https://portal.army.idf/sites/schedule/DB/';
const STORAGE_KEY = 'formats';
const isDevelopment = import.meta.env.DEV;

export const formatService = {
  async getFormats(sw: any): Promise<Format[]> {
    if (isDevelopment) {
      const storedFormats = localStorage.getItem(STORAGE_KEY);
      return Promise.resolve(storedFormats ? JSON.parse(storedFormats) : []);
    }

    const response = await fetch(`${API_URL}/${sw.englishName}/formats`, {
      headers: {
        accept: 'application/json;odata=verbose',
      },
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch formats');
        console.log("getFormats() response:", response);
        return response.json();
      })
      .then((res) => {
        console.log("res.json", res);
        const items = res?.d?.results || [];
        return items.map((item: any) => ({
          id: item.Id,
          name: item.Title,
          uploadDate: item.Modified,
          uploadedBy: item.Editor.Title,
          downloadUrl: item.EncodedAbsUrl,
        }));
      });
  },

  async uploadFormat(file: File, name: string, user: User, SW: any): Promise<Format> {
    if (isDevelopment) {
      const formats = await this.getFormats(SW);
      const newFormat: Format = {
        id: Date.now().toString(),
        name,
        uploadDate: new Date().toISOString(),
        uploadedBy: user.name || '', // In development, we'll just use a static name
        downloadUrl: URL.createObjectURL(file), // Create a local URL for the file
      };
      console.log("#newFormat", newFormat);
      const updatedFormats = [...formats, newFormat];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
      return newFormat;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Getting the Request Digest
    const contextInfo = await fetch(`https://portal.army.idf/sites/schedule/_api/contextinfo`, {
      method: "POST",
      headers: {
        accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
      },
      credentials: "include",
    });

    const contextData = await contextInfo.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    const encodedFileName = encodeURIComponent(file.name);
    const folderName = `/sites/schedule/DB/SW-${SW.englishName}/formats`;
    const uploadUrl = `${folderName}/Files/add(url='${encodedFileName}', overwrite=true)`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-RequestDigest": digest,
        "Content-Type": "application/json;odata=verbose",
        accept: "application/json;odata=verbose",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      console.error("upload failed", uploadRes);
      throw new Error("upload failed");
    }

    const downloadUrl = `https://portal.army.idf/sites/schedule/DB/SW-${SW.englishName}/formats/${encodedFileName}`;
    return {
      id: user?.id || crypto.randomUUID(), // אם אין מזהה נשתמש ברנדום
      name,
      uploadDate: new Date().toISOString(),
      uploadedBy: user.name,
      downloadUrl: URL.createObjectURL(file),
    };
  },

  async deleteFormat(id: string, SW: any): Promise<void> {
    if (isDevelopment) {
      const formats = await this.getFormats(SW);
      const updatedFormats = formats.filter((format) => format.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
      return;
    }

    const contextInfo = await fetch(`https://portal.army.idf/sites/schedule/_api/contextinfo`, {
      method: "POST",
      headers: {
        accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
      },
      credentials: "include",
    });

    const contextData = await contextInfo.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    const response = await fetch(`${API_URL}/${SW.englishName}/_api/web/lists/getbytitle('formats')/items('${id}')`, {
      method: "DELETE",
      headers: {
        "X-RequestDigest": digest,
        "IF-MATCH": "*",
      },
    });

    if (!response.ok) throw new Error("Failed to delete format");
  },

  async updateFormat(id: string, name: string, SW: any): Promise<Format> {
    if (isDevelopment) {
      const formats = await this.getFormats(SW);
      const updatedFormats = formats.map(format => 
        format.id === id ? { ...format, name } : format
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
      return updatedFormats.find(format => format.id === id)!;
    }

    const contextInfo = await fetch(`https://portal.army.idf/sites/schedule/_api/contextinfo`, {
      method: "POST",
      headers: {
        accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
      },
      credentials: "include",
    });

    const contextData = await contextInfo.json();
    const digest = contextData.d.GetContextWebInformation.FormDigestValue;

    const response = await fetch(`${API_URL}/${SW.englishName}/_api/web/lists/getbytitle('formats')/items('${id}')`, {
      method: "POST",
      headers: {
        "X-RequestDigest": digest,
        "Content-Type": "application/json;odata=verbose",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify({
        Title: name,
      }),
    });

    if (!response.ok) throw new Error("Failed to update format");

    return {
      id,
      name,
      uploadDate: new Date().toISOString(),
      uploadedBy: "", // This will be updated by the server
      downloadUrl: "", // This will be updated by the server
    };
  },
};
