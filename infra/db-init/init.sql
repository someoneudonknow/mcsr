CREATE DATABASE auth_db;
CREATE DATABASE spatial_db;

CREATE USER auth_user WITH ENCRYPTED PASSWORD 'yMBaQ7bZuYAyN1Tf';
grant all privileges
on database auth_db
to auth_user
;
ALTER DATABASE auth_db OWNER TO auth_user;

CREATE USER spatial_user WITH ENCRYPTED PASSWORD 'lm5995yIO2xTRBFT';
grant all privileges
on database spatial_db
to spatial_user
;
ALTER DATABASE spatial_db OWNER TO spatial_user;
