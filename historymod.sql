-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb2
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 21-05-2013 a las 18:29:17
-- Versión del servidor: 5.5.31
-- Versión de PHP: 5.4.4-14

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `AMMS`
--

CREATE TABLE IF NOT EXISTS `AMMS` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ammsId` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `activePower` text COLLATE utf8_spanish_ci NOT NULL,
  `reactivePower` text COLLATE utf8_spanish_ci NOT NULL,
  `timeInstant` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ammsIdANDtimeInstant` (`ammsId`,`timeInstant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Nodes`
--

CREATE TABLE IF NOT EXISTS `Nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lampId` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `presence` text COLLATE utf8_spanish_ci NOT NULL,
  `batteryCharge` text COLLATE utf8_spanish_ci NOT NULL,
  `illuminance` text COLLATE utf8_spanish_ci NOT NULL,
  `timeInstant` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lampIdANDtimeInstant` (`lampId`,`timeInstant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Regulator`
--

CREATE TABLE IF NOT EXISTS `Regulator` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `regId` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `activePower` text COLLATE utf8_spanish_ci NOT NULL,
  `reactivePower` text COLLATE utf8_spanish_ci NOT NULL,
  `electricPotential` text COLLATE utf8_spanish_ci NOT NULL,
  `electricCurrent` text COLLATE utf8_spanish_ci NOT NULL,
  `timeInstant` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `regIdANDtimeInstant` (`regId`,`timeInstant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
