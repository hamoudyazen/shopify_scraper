import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
})
export class ProductPageComponent implements OnInit {
  //url: string = 'https://www.kickgame.co.uk/collections/air-jordan-1/products.json?limit=200000000';
  airjordan1: any[] = []; // Change the type to an array and initialize as an empty array
  airjordan1final: any[] = []; // Initialize as an empty array
  max: any;
  imageCount = 0;
  sizes: any[] = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46',]
  //sizes: string[] = ['S', 'M', 'L', 'XL']; // Use string values for size
  pageURLs: string[] = [];
  //baseURL: string = 'https://www.kickscrew.com/collections/converse/products.json?product_categories=1';
  //baseURL: string = 'https://kickgame.co.uk/collections/trapstar/products.json';
  //baseURL: string = 'https://kickcourt.com/collections/sacai/products.json';

  baseURL: string = 'https://dunks.co.il/collections/best-sellers/products.json';

  totalPages: number = 10; // Update this with the total number of pages you want to fetch
  //totalPages: number = 317; // Update this with the total number of pages you want to fetch

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.generatePageURLs();
    this.check();
  }
  generatePageURLs() {
    for (let page = 1; page <= this.totalPages; page++) {
      const urlWithPage = `${this.baseURL}?page=${page}`;
      this.pageURLs.push(urlWithPage);
    }
  }
  check() {
    for (let i = 0; i < this.totalPages; i++) {
      this.http.get<any>(this.pageURLs[i]).subscribe(
        (data) => {
          console.log(data);
          this.airjordan1 = data.products;
          this.findMaxPriceForVariants();
        },
        (error) => {
          console.error('Error occurred:', error);
        }
      );
    }
  }

  convertToILS(priceInGBP: number): number {
    // In this example, we assume the exchange rate is 5.0 ILS per 1 GBP
    const exchangeRate: number = 2.0;
    return priceInGBP * exchangeRate;
  }

  generateRandomPrice() {
    const minPrice = 320;
    const maxPrice = 380;
    const generatedPrice = Math.random() * (maxPrice - minPrice) + minPrice;
    return generatedPrice.toFixed(2);
  }

  findMaxPriceForVariants() {
    for (let product of this.airjordan1) {
      this.max = product.variants[0].price;
      let count = 0
      for (let variant of product.variants) {
        if (parseFloat(variant.price) > parseFloat(this.max) && variant.available === true) {
          this.max = variant.price;
          count++;
        }
        if (count === 1) {
          break;
        }
      }
      console.log('Max Price for', product.title, ':', this.max);

      if (this.max < 300) {
        this.max = this.max * 2;
      }
      // Create a new customProducts object with properties from the original product
      let customProducts: any = {
        title: product.title,
        describe: product.body_html,
        // price: this.max = this.convertToILS(parseFloat(this.max)),
        price: this.generateRandomPrice(),
        images: product.images,
        sku: product.variants[0].sku, // Use the previously extracted SKU
        tags: product.tags[0],
        vendor: product.vendor,
      };


      this.airjordan1final.push(customProducts); // Push the customProducts object
    }
    console.log('Modified Products:', this.airjordan1final); // You can check the modified products here
  }

  exportToCSV() {
    const csvData: any[] = [];
    const shopifyHeader = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Tracker',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Variant Fulfillment Service',
      'Variant Price',
      'Variant Compare At Price',
      'Variant Requires Shipping',
      'Variant Taxable',
      'Variant Barcode',
      'Image Src',
      'Image Position',
      'Image Alt Text',
      'Gift Card',
      'SEO Title',
      'SEO Description',
      'Google Shopping / Google Product Category',
      'Google Shopping / Gender',
      'Google Shopping / Age Group',
      'Google Shopping / MPN',
      'Google Shopping / AdWords Grouping',
      'Google Shopping / AdWords Labels',
      'Google Shopping / Condition',
      'Google Shopping / Custom Product',
      'Google Shopping / Custom Label 0',
      'Google Shopping / Custom Label 1',
      'Google Shopping / Custom Label 2',
      'Google Shopping / Custom Label 3',
      'Google Shopping / Custom Label 4',
      'Variant Image',
      'Variant Weight Unit',
      'Variant Tax Code',
      'Cost per item',
      'Status',
    ];

    csvData.push(shopifyHeader);

    // Loop through the modified products and format data according to the Shopify CSV structure
    for (let product of this.airjordan1final) {
      this.imageCount = 0;
      const sku = product.sku
      //const imagesBySize = this.groupImagesBySize(product.images, this.sizes);
      const imagesBySize = this.groupImagesBySize(product.images, this.sizes.map(String));



      for (let i = 0; i < this.sizes.length; i++) {
        const size = this.sizes[i];
        const images = imagesBySize[size].join(', ');
        if (i == 0) {
          csvData.push([
            product.title,
            product.title,
            product.describe,
            product.vendor,
            '',
            product.tags, // Tags (Add tags if needed, comma-separated)
            'TRUE', // Published (TRUE/FALSE)
            'size', // Option1 Name
            size, // Option1 Value
            sku, // Variant SKU
            '0.0', // Variant Grams
            'shopify', // Variant Inventory Tracker
            '100', // Variant Inventory Qty
            'deny', // Variant Inventory Policy
            'manual', // Variant Fulfillment Service
            product.price, // Variant Price
            '', // Variant Compare At Price
            'TRUE', // Variant Requires Shipping
            'TRUE', // Variant Taxable
            '', // Variant Barcode
            images, // Image Src (comma-separated URLs of images, using all images for each size)
            '', // Image Position
            '', // Image Alt Text
            'FALSE', // Gift Card (TRUE/FALSE)
            '', // SEO Title
            '', // SEO Description
            '', // Google Shopping / Google Product Category
            '', // Google Shopping / Gender
            '', // Google Shopping / Age Group
            '', // Google Shopping / MPN
            '', // Google Shopping / AdWords Grouping
            '', // Google Shopping / AdWords Labels
            '', // Google Shopping / Condition
            '', // Google Shopping / Custom Product
            '', // Google Shopping / Custom Label 0
            '', // Google Shopping / Custom Label 1
            '', // Google Shopping / Custom Label 2
            '', // Google Shopping / Custom Label 3
            '', // Google Shopping / Custom Label 4
            images, // Variant Image (comma-separated URLs of variant images, same as Image Src)
            'kg', // Variant Weight Unit (check for correct unit: kg, g, lb, oz)
            '', // Variant Tax Code
            '', // Cost per item (leave empty for default)
            'active', // Status (active/inactive)
          ]);
        }
        else {
          csvData.push([
            product.title,
            product.title,
            product.describe,
            product.vendor,
            '',
            product.tags, // Tags (Add tags if needed, comma-separated)
            'TRUE', // Published (TRUE/FALSE)
            'size', // Option1 Name
            size, // Option1 Value
            sku, // Variant SKU
            '0.0', // Variant Grams
            'shopify', // Variant Inventory Tracker
            '100', // Variant Inventory Qty
            'deny', // Variant Inventory Policy
            'manual', // Variant Fulfillment Service
            product.price, // Variant Price
            '', // Variant Compare At Price
            'TRUE', // Variant Requires Shipping
            'TRUE', // Variant Taxable
            '', // Variant Barcode
            images, // Image Src (comma-separated URLs of images, using all images for each size)
            '', // Image Position
            '', // Image Alt Text
            'FALSE', // Gift Card (TRUE/FALSE)
            '', // SEO Title
            '', // SEO Description
            '', // Google Shopping / Google Product Category
            '', // Google Shopping / Gender
            '', // Google Shopping / Age Group
            '', // Google Shopping / MPN
            '', // Google Shopping / AdWords Grouping
            '', // Google Shopping / AdWords Labels
            '', // Google Shopping / Condition
            '', // Google Shopping / Custom Product
            '', // Google Shopping / Custom Label 0
            '', // Google Shopping / Custom Label 1
            '', // Google Shopping / Custom Label 2
            '', // Google Shopping / Custom Label 3
            '', // Google Shopping / Custom Label 4
            images, // Variant Image (comma-separated URLs of variant images, same as Image Src)
            'kg', // Variant Weight Unit (check for correct unit: kg, g, lb, oz)
            '', // Variant Tax Code
            '', // Cost per item (leave empty for default)
            'active', // Status (active/inactive)
          ]);
        }
      }
    }

    // Create the CSV file using PapaParse
    const csv = Papa.unparse(csvData, {
      header: false, // No need for an additional header row, as we've already added Shopify headers above
      delimiter: ',',
    });

    // Create a Blob object with the CSV data and trigger a download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Helper function to group images by size
  /*
  groupImagesBySize(images: any[], sizes: number[]): { [key: number]: string[] } {
    const imagesBySize: { [key: number]: string[] } = {};

    // Initialize the imagesBySize object with empty arrays for each size
    sizes.forEach((size) => {
      imagesBySize[size] = [];
    });

    // Group the images by size
    images.forEach((image, index) => {
      const sizeIndex = index % sizes.length;
      const size = sizes[sizeIndex];
      imagesBySize[size].push(image.src);
    });

    return imagesBySize;
  }
  */
  groupImagesBySize(images: any[], sizes: string[]): { [key: string]: string[] } {
    const imagesBySize: { [key: string]: string[] } = {};

    // Initialize the imagesBySize object with empty arrays for each size
    sizes.forEach((size) => {
      imagesBySize[size] = [];
    });

    // Group the images by size
    images.forEach((image, index) => {
      const sizeIndex = index % sizes.length;
      const size = sizes[sizeIndex];
      imagesBySize[size].push(image.src);
    });

    return imagesBySize;
  }

}
