import React from "react";
import logo from '../images/logo.svg';

function Header() {
  return (    
    <header className="header">
      <a href="#" target="_blank" rel="noopener" className="header__logo"><img src={logo} alt="Логотип Место Россия" /></a>
    </header>
  )
}

export default Header;