export async function getGumroadProduct(id: string) {
  try {
    const data = await fetch("https://api.gumroad.com/v2/products/" + id, {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${process.env.GUMROAD_TOKEN}`,
        "Content-Type": "application/json",
      }),
    });
    const { product } = await data.json();
    // I had to add this manually since GumRoad API doesn't provide the total sales by paid customers
    return {
      totalDownloads: Number(product.sales_count),
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("GUMROAD ERROR: ", e);
  }
}

export async function getGumroadProductSales(id: string, url?: string) {
  try {
    let path = url ?? "/v2/sales?product_id=" + id;
    const data = await fetch("https://api.gumroad.com" + path, {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${process.env.GUMROAD_TOKEN}`,
        "Content-Type": "application/json",
      }),
    });
    return await data.json();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("GUMROAD ERROR: ", e);
  }
}

// export async function getGumroadProductSocialProof(id: string) {
//   const socialProof: SocialProof = {
//     totalDownloads: 0,
//     totalSales: 0,
//     sales: 0,
//     rating: 0,
//   };
//   const product = await getGumroadProduct(id);
//   socialProof.totalDownloads = product.sales_count;

//   let productSales = await getGumroadProductSales(id);
//   do {
//     if (productSales.success) {
//       console.log({ productSales });
//       productSales.sales.forEach((sale: any) => {
//         socialProof.totalSales += 1;
//         socialProof.sales += sale.price / 100;
//         if (sale.product_rating) {
//           socialProof.rating += sale.product_rating ? Number(sale.product_rating) : 0;
//         }
//       });
//     }
//     if (productSales.next_page_url && productSales.sales.length > 0) {
//       productSales = await getGumroadProductSales(id, productSales.next_page_url);
//     }
//   } while (productSales.next_page_url);
//   socialProof.rating = socialProof.rating / socialProof.totalSales;

//   return socialProof;
// }
