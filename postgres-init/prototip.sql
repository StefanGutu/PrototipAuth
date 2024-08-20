CREATE TABLE usercredential(
	id varchar(100),
	pubkey varchar(200),
	algorithm varchar(50),
	transports TEXT[]
)

CREATE TABLE userdata(
	username varchar(100),
	userpassword varchar(100),
	userid varchar(100)
)