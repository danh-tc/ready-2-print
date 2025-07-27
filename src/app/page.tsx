import "@/styles/global.scss";
import "@/styles/_reset.scss";
// import "cropperjs/dist/cropper.css";
import LayoutConfigurator from "@/components/layout/LayoutConfigurator";

export default function Home() {
  return (
    <>
      <h1>Ready 2 Print</h1>
      <LayoutConfigurator />
    </>
  );
}
