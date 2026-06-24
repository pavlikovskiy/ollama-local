CREATE TABLE `WIKIPROXY` (
                             `ID` varchar(24) NOT NULL,
                             `URL` varchar(1024) DEFAULT NULL,
                             `pageClob` longtext,
                             `creationDate` datetime DEFAULT NULL,
                             PRIMARY KEY (`ID`),
                             KEY `url` (`URL`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
