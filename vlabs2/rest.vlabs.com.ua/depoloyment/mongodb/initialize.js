db.users.insertMany([
    {
        username: "vlabs.com.ua@gmail.com",
        password: "$2a$04$EIAMeAsIQeRSI/WR9JpZb.IWaAYFEO7w.6WsaGz.cFsNwRV1rG3Ju", //maska ;)
        enabled: true,
        roles: [
            "ROLE_USER",
            "ROLE_ADMIN"
        ],
        email: "vlabs.com.ua@gmail.com"
    },
    {
        username: "maskame@gmail.com",
        password: "$2a$04$/dmHEfAsFr/E557kLBp81Ohc7x8vIUJO.LBoFmAkiknrdBIWFD/a2", //123
        enabled: true,
        roles: [
            "ROLE_USER"
        ],
        email: "maskame@gmail.com"
    }
]);