import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
const Layout = (props) => {
  return (
    <div>
      <Header />
      <main>{props.children}</main>
      <ToastContainer />
      <Footer />
    </div>
  );
};

export default Layout;
