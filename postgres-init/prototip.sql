CREATE TABLE usercredential(
	id varchar(100) PRIMARY KEY,
	pubkey varchar(200),
	algorithm varchar(50),
	transports TEXT[]
	userid varchar(100),
	FOREIGN KEY (userid) REFERENCES userdata(userid)
)

CREATE TABLE userdata(
	username varchar(100),
	userpassword varchar(100),
	userid varchar(100) PRIMARY KEY
)