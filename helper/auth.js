const { authModel } = require("../models/auth.model");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
    try {
        const { authToken } = req.body.myData;
        if (!authToken) {
            return res.status(401).send({ message: 'Access Denied', status: 'unauthorized' });
        }

        const isExists = await authModel.exists({ authToken })
        if (!isExists) {
            return res.status(401).send({ message: 'Access Denied', status: 'unauthorized' });
        }

        try {
            jwt.verify(authToken, process.env.SECRET_KEY);
            const { userName } = jwt.decode(authToken);
            req.headers.userName = userName;
        } catch (error) {
            return res.status(401).send({ message: 'Access Denied', status: 'unauthorized' });
        }
        next();
    } catch (error) {
        console.log("Error in auth middleware::authenticate", error);
        return res.status(500).send({ message: 'Internal Server Error', status: 'error' });
    }
};


module.exports = {
    authenticate,
}