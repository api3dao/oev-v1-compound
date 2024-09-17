import Header from "./Header";
import Footer from "./Footer";
import CurvesDecoration from "./CurvesDecoration";

export default function Layout({ children }: any) {
  return (
    <>
      <CurvesDecoration />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
