const isBase64 = require("is-base64");
const base64img = require("base64-img");
const fs = require("fs");
const { Media } = require("../models");

const { HOSTNAME } = process.env;

module.exports = {
    index: async (_, res) => {
        try {
            const media = await Media.findAll({
                attributes: ["id", "image"],
            });

            const mappedMedia = media.map((m) => {
                m.image = `${HOSTNAME}/${m.image}`;
                return m;
            });

            return res.json({
                status: "success",
                message: "Berhasil mendapatkan list media",
                data: mappedMedia,
            });
        } catch (error) {
            console.log(error)
            const { status, data } = error.response;
            return res.status(status).json(data);
        }
    },
    store: (req, res) => {
        const image = req.body.image;

        if (!isBase64(image, { mimeRequired: true })) {
            return res.status(400).json({
                status: "error",
                message: "invalid base64",
            });
        }

        base64img.img(
            image,
            "./public/images",
            Date.now(),
            async (err, filePath) => {
                try {
                    if (err) {
                        return res.status(400).json({
                            status: "error",
                            message: err.message,
                        });
                    }

                    const fileName = filePath.split("/").pop();
                    const media = await Media.create({
                        image: `images/${fileName}`,
                    });

                    return res.json({
                        status: "success",
                        message: "Berhasil mengupload image",
                        data: {
                            id: media.id,
                            image: `${HOSTNAME}/images/${fileName}`,
                        },
                    });
                } catch (error) {
                    const { status, data } = error.response;
                    return res.status(status).json(data);
                }
            }
        );
    },
    destroy: async (req, res) => {
        try {
            const { status, data } = error.response;
            return res.status(status).json(data);
        } catch (error) {
            const { id } = req.params;
            const media = await Media.findByPk(id);

            if (!media) {
                return res.status(404).json({
                    status: "error",
                    message: "Media not found",
                });
            }

            fs.unlink(`./public/${media.image}`, async (err) => {
                if (err) {
                    return res.status(400).json({
                        status: "error",
                        message: err.message,
                    });
                }

                await media.destroy();
                return res.json({
                    status: "success",
                    message: "image deleted",
                });
            });
        }
    },
};
