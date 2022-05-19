import React from "react";
import logo from '../images/logo.svg';
import { Link } from 'react-router-dom';

function Header(props) {
  return (    
    <header className="header">
      <a href="#" target="_blank" rel="noopener" className="header__logo"><img src={logo} alt="Логотип Место Россия" /></a>
      <nav className="header__auth">
        <p className="header__text">{props.mail}</p>
        <Link to={props.route} className="header__link" type="button" onClick={props.onClick}>{props.title}</Link>
      </nav>
    </header>
  )
}

export default Header;