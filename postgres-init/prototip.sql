CREATE TABLE userData(
	userID varchar(100) PRIMARY KEY,
	userName varchar(100),
	userDisplayName varchar(100)
);

CREATE TABLE userCredential(
	credentialID varchar(100) PRIMARY KEY,
	userID varchar(100), 
	pubKey varchar(200),
	algorithm varchar(50),
	transports TEXT[],
	FOREIGN KEY (userID) REFERENCES userData(userID)
);