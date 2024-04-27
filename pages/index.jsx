import { useState, useRef, useEffect } from "react";
import  axios  from "axios";
import Head from "next/head";
import Files from "@/components/Files";
import { storage } from "./firebase";
import { ref, listAll, uploadBytes, getDownloadURL, getMetadata } from "@firebase/storage"
import { v4 } from 'uuid';

export default function Home() {
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);

  const [imageUpload, setimageUpload] = useState(null);
  const [imageList, setimageList] = useState([]);

  useEffect(() => {
    fetchImage();
  }, [])
  

  // const inputFile = useRef(null);

  async function uploadImage (image) {

    if (!image) {
      alert("Kindly Select File to Upload!");
      return;
    }
    if (imageUpload == null) return;
    try {
      setUploading(true);
      const fileName = imageUpload.name + v4();
      const formData = new FormData();
      formData.append("file", imageUpload);
      // formData.forEach((value,key) => {
      //   console.log(key+": "+value)
      // });
      // const res = await fetch("/api/files", {
      //   method: "POST",
      //   body: formData,
      // });
      // const ipfsHash = await res.text();
      // setCid(ipfsHash);

      const pinataMetadata = JSON.stringify({
        name: imageUpload.name,
      });
      formData.append('pinataMetadata', pinataMetadata);
  
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      })
      formData.append('pinataOptions', pinataOptions);
      const JWT= process.env.NEXT_PUBLIC_PINATA_JWT;
      try {
        console.log();
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          maxBodyLength: "Infinity",
          headers: {
            'Content-Type': `multipart/form-data`, 'boundary' : `${formData._boundary}`, //boundary=${formData._boundary}
            'Authorization': `Bearer ${JWT}`
          }
        });
        console.log(res.data);
        const data = res.data;
        const hash = data.IpfsHash;
        console.log(hash);
        // setCid(hash);
        // console.log(cid)
        console.log(`https://salmon-able-shrimp-460.mypinata.cloud/ipfs/${hash}`);
        try{
          const imageRef = ref(storage, `images/${fileName}`);
          const metadata = {
            customMetadata: {
              cid: hash,
              publicUrl:`https://salmon-able-shrimp-460.mypinata.cloud/ipfs/${hash}`,
              uploadTime: new Date().toISOString(),
            }
          };
          uploadBytes(imageRef, imageUpload, metadata).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
              getMetadata(snapshot.ref).then(metadata => {
                const imageData = { url, name: fileName, metadata };
                setimageList((prev) => [...prev, imageData])
              })
              
            })      
          })
          setFile(null);
        }
        catch(e){
          console.log("Failed to upload in firebase due to " + e);
          alert("Couldnot upload in firebase");
        }
        setFile(null);
      }
      catch (error) {
        console.log(error);
        alert("Could not upload at pinata");
      }

      
      // console.log(cid);

      // console.log(`IPFS CID: ${cid}`)
      // console.log(`Gateway URL: https://salmon-able-shrimp-460.mypinata.cloud/ipfs/${cid}`)
      // console.log(`https://salmon-able-shrimp-460.mypinata.cloud/ipfs/${cid}`)
      
      // setUploading(false);
    // } 
    

    
    // try {
    //   const formData = new FormData();
    //   formData.append("newFile", newFile, newFile.name);
    //   const res = await fetch("/api/files/route", {
    //     method: "POST",
    //     body: formData,
    //   });
    //   const ipfsHash = await res.text();
    //   setCid(ipfsHash);
    //   setUploading(false);
    //   console.log(`IPFS CID: ${cid}`)
    //   console.log(`Gateway URL: https://salmon-able-shrimp-460.mypinata.cloud/ipfs/${cid}`)
    //   console.log(`https://salmon-able-shrimp-460.mypinata.cloud/ipfs/${cid}`)
      setUploading(false);
      setFile(null);
    }
    // catch (e) {
    //   console.log(e);
    // }
      
    catch (e) {
      console.log(e);
      setUploading(false);
      setFile(null);
      alert("Trouble uploading file");
    }
  };

  async function fetchImage () {
    try {
      const imageRefList = ref(storage, "images/");
      const promises = [];
      // const urls = [];
      listAll(imageRefList).then((response) => {
        // console.log(response)
        response.items.forEach((item) => {
          promises.push(
            getDownloadURL(item).then((url) => {
            return getMetadata(item).then(metadata => {
              return {url, name: item.name, metadata};
            })
          }));
        
          // getDownloadURL(item).then((url) => {
          //   // if (!urls.includes(url)) {
          //   //   urls.push(url);
          //   //   console.log(urls);
          //   // }
          //   // setimageList([ url]);
          //   setimageList((prev) => [...prev, url]);
          //   // setimageList(urls);
          // })
        });

        Promise.all(promises).then((imageData) => {
        // Set the imageList state with the fetched URLs
        setimageList(imageData);
        console.log(imageData);
      });
      })
      
    } catch (error) {
      console.error("Error fetching files from Firebase Storage:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    uploadImage(e.target.files[0]);
  };

  return <>
    <Head>
        <title>DeCentralised IPFS Storage</title>
        <meta name="description" content="DeCentralised IPFS Storage Generated using Pinata and Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/pinnie.png" />
    </Head>

    <div className="min-h-screen bg-gray-100">
    {/* Navbar */}
    <nav className="bg-gray-800 py-4 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-white text-2xl">IPFS Store</h1>
      </div>
    </nav>
  
    {/* Main content */}
    <main className="container mx-auto px-4 py-8 text-center">
      {/* Upload section */}
      <section className="bg-white mx-auto shadow-md rounded-md p-6 mb-8 w-min">
        <h2 className="text-xl font-semibold mb-4">Upload your photo</h2>
        <input
          type="file"
          onChange={ (event) => {setimageUpload(event.target.files[0]);} } //(event) => {setimageUpload(event.target.files[0]);}
          className="mb-4"
        />
        <button onClick={uploadImage} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Upload Image
        </button>
      </section>
  
      {/* Display uploaded images */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* {imageList.map((url) => {
        return <img src={url} className="rounded-md" />
      })} */}
      
        {imageList.map((image) => {
          return (
            <div key={image.name} className="bg-white rounded-md shadow-md p-4">
              <img src={image.url} alt={image.name} className="rounded-md mb-4" />
              <div className="text-sm">
                <p className="text-gray-600">Name: {image.name}</p>
                <p className="text-gray-600">CID: {image.metadata && image.metadata.customMetadata ? image.metadata.customMetadata.cid : 'N/A'}</p>
                <p className="text-gray-600">URL: <a href={image.metadata && image.metadata.customMetadata ? image.metadata.customMetadata.publicUrl : '#'}></a>{image.metadata && image.metadata.customMetadata ? image.metadata.customMetadata.publicUrl : 'N/A'}</p>
                {/* <p className="text-gray-600">{image.metadata && image.metadata.customMetadata ? image.metadata.customMetadata.uploadTime : 'N/A'}</p> */}
                {/* Display other metadata properties as needed */}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  </div>
  </>

//   return (
//     <>
//       <Head>
//         <title>Pinata Next.js App</title>
//         <meta name="description" content="Generated with create-pinata-app" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/pinnie.png" />
//       </Head>
//       <main className="w-full min-h-screen flex justify-center items-center">
//         <div className="w-full max-w-screen-md p-8">
//           <h1 className="text-3xl font-bold mb-4">Pinata + Next.js</h1>
//           <p className="mb-8">
//             Update the <span className="py-1 px-2 rounded-md italic border-2 border-accent">.env.local</span> file to set your Pinata API key and (optionally) your IPFS gateway URL, restart the app, then click the Upload button and you'll see uploads to IPFS just work™️. If you've already uploaded files, they will appear below.
//           </p>
//           <div className="flex items-center gap-4 mb-4">
//             <input
//               type="file"
//               id="file"
//               ref={inputFile}
//               onChange={handleChange}
//               style={{ display: "none" }}
//             />
//             <label
//               htmlFor="file"
//               className="bg-secondary text-light rounded-md px-4 py-2 cursor-pointer hover:bg-accent transition-all duration-300 ease-in-out"
//             >
//               {uploading ? "Uploading..." : "Upload"}
//             </label>
//             <button
//               onClick={() => setCid("")}
//               className="bg-light text-secondary border-2 border-secondary rounded-md px-4 py-2 hover:bg-secondary hover:text-light transition-all duration-300 ease-in-out"
//             >
//               Clear
//             </button>
//           </div>
//           {cid && (
//             <div className="bg-gray-100 p-4 rounded-md">
//               <Files cid={cid} />
//             </div>
//           )}
//         </div>
//       </main>
//     </>
//   );
}
