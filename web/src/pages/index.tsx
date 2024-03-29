import { saveAs } from "file-saver";
import JSZip from "jszip";
import Head from "next/head";
import { ChangeEvent, useState } from "react";

declare global {
  interface Window {
    Native: any;
  }
}

const Home = () => {
  const [imagesToDownload, setImagesToDownload] = useState<string[]>([]);

  const getFileName = () =>
    `Minha-BLZ ${new Date().toLocaleDateString(
      "pt-BR"
    )} as ${new Date().toLocaleTimeString("pt-BR", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })}`.replace(/\//g, "-");

  const downloadImages = async () => {
    if (window.Native) {
      const files = imagesToDownload.map((fileUrl) => ({
        fileUrl: fileUrl,
        fileName: getFileName(),
      }));
      setImagesToDownload([]);
      return window.Native.downloadImage(files);
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (imagesToDownload.length > 1 && isIOS) {
      const zip = new JSZip();
      imagesToDownload.forEach((image) => {
        zip.file(getFileName(), image);
      });
      return await zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, getFileName());
      });
    }
    imagesToDownload.forEach((image) => {
      saveAs(image, getFileName());
    });
    setImagesToDownload([]);
  };

  const handleChangeCheckbox =
    (image: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        return setImagesToDownload([...imagesToDownload, image]);
      }
      setImagesToDownload(imagesToDownload.filter((img) => img !== image));
    };

  return (
    <div className="flex flex-col justify-center items-center gap-2 w-screen h-screen">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex gap-4">
        {[`/1-200x300.jpg`, `/376-200x300.jpg`, `/523-200x300.jpg`].map(
          (src) => (
            <label key={src} className="flex flex-col gap-4">
              <img
                src={src}
                alt="download image"
                className="max-w-[120px] max-h-[120px] border border-solid border-black"
              />
              <input
                type="checkbox"
                className="self-center"
                onChange={handleChangeCheckbox(src)}
                checked={imagesToDownload.includes(src)}
              />
            </label>
          )
        )}
      </div>
      <button
        onClick={downloadImages}
        className="p-2 bg-black text-white rounded-md"
      >
        download
      </button>
    </div>
  );
};

export default Home;
