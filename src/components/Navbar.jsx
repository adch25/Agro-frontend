import React from "react";
import Logo1 from "../assets/images/MainLogo_TransparentBg.png";
import Logo2 from "../assets/images/logo.png";

const Navbar = () => {
  return (
    <div className="navbar_container">
      <div className="nav__content">
        <div className="main_nav_logo">
          <img src={Logo1} alt="nav_logo" />
        </div>
        <div className="main_nav_company_logo">
          <img src={Logo2} alt="nav_logo" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
