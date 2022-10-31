import Product from "../models/Product.model.js";
import path from "path";
import fs from "fs";

export const getProducts = async (req, res) => {
  try {
    const response = await Product.findAll();
    res.json(response);
  } catch (error) {
    console.error(error.message);
  }
};

export const getProductById = async (req, res) => {
  try {
    const response = await Product.findOne({
      where: { id: req.params.id },
    });
    res.json(response);
  } catch (error) {
    console.error(error.message);
  }
};

export const saveProduct = async (req, res) => {
  if (!req.files) return res.status(400).json({ message: "No file uploaded" });
  const name = req.body.title;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLowerCase()))
    return res.status(422).json({ message: "Invalid Image" });
  if (fileSize > 5000000)
    return res.status(422).json({ message: "Image must be less than 5 MB" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ message: err.message });
    try {
      const response = await Product.create({
        name: name,
        image: fileName,
        url: url,
      });
      res
        .status(201)
        .json({ message: "Product Created Successfuly", response });
    } catch (error) {
      console.error(error.message);
    }
  });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findOne({
    where: { id: req.params.id },
  });
  if (!product) return res.status(404).json({ message: "Data not found" });

  let fileName = "";
  if (!req.files) fileName = product.image;
  else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ message: "Invalid Image" });
    if (fileSize > 5000000)
      return res.status(422).json({ message: "Image must be less than 5 MB" });

    const filePath = `./public/images/${product.image}`;
    fs.unlinkSync(filePath);

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ message: err.message });
    });
  }

  const name = req.body.title;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

  try {
    await Product.update(
      { name, image: fileName, url },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ message: "Product Updated Successfuly" });
  } catch (error) {
    console.error(error.message);
  }
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findOne({
    where: { id: req.params.id },
  });
  if (!product) return res.status(404).json({ message: "Data not found" });

  try {
    const filePath = `./public/images/${product.image}`;
    fs.unlinkSync(filePath);

    await Product.destroy({
      where: { id: req.params.id },
    });
    res.status(200).json({ message: "Product Deleted Successfuly" });
  } catch (error) {
    console.error(error.message);
  }
};
