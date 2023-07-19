import { useEffect, useState, useContext} from "react";
import { ProductTableCard } from "../../components/table-card/table-card.component";
import { useRef } from "react";
import { UserContext } from "../../contexts/user.context";
import { data } from "jquery";
import daterangepicker from "daterangepicker";

//Download CSV of Javascript Array
const exportToCsv = function( itemList) {
  var CsvString = "";
  itemList.forEach(function(RowItem, RowIndex) {
    RowItem.forEach(function(ColItem, ColIndex) {
      CsvString += ColItem + ',';
    });
    CsvString += "\r\n";
  });
  CsvString = "data:application/csv," + encodeURIComponent(CsvString);
  var x = document.createElement("A");
  
  const csvName = `inventory_${Date.now()}.csv`;
  x.setAttribute("href", CsvString );
  x.setAttribute("download",csvName);
  document.body.appendChild(x);
  x.click();
}

export const InventoryDashboard = () => {
  const inventory = useRef([]);
  const [products, setProducts] = useState([]);
  const {currentUser} = useContext(UserContext);
  const [productIDs, setProductIDs] = useState([]);
  useEffect(() => {
    ( async () => {
      if (currentUser){
        const urlRequest = "http://127.0.0.1:80/spm/get_inventory";
        const response =  await fetch(urlRequest, {
          method: 'get', mode: 'cors', contentType: 'application/json',
        });
        const response_data = await response.json();
        inventory.current = response_data;
        
        setProducts(response_data["products"]);
        setProductIDs(response_data["product_ids"]);
        console.log(response_data);
      }
    }
    )()
  }, [])

  const onClickExport = () => {
    const itemList = [["product_type", "product_id", "recieved", "used", "dispatched", "quantity_type", "remaining"]];

    products.map(({product_details}) => {
      product_details.map(({product_type, product_id, recieved, used, dispatched, quantity_type}) => {
        itemList.push([product_type, product_id, recieved, used || 0, dispatched || 0, quantity_type || "No's", recieved-(dispatched||0)]);
      });
    })
    console.log(itemList);

    exportToCsv(itemList);
  }

  if (!currentUser){
    return ("");
  }
  return (
    <div className="content-page">
        <div className="content">
            <div className="container-fluid">
              <div className="row">
                  <div className="col-sm-4">
                      <div className="page-title-box">
                          <h3 className="page-title">Inventory Dashboard</h3>
                      </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="page-title-box text-sm-end">
                      <div className="btn-group mt-3 ms-1">
                        <button type="button" id="ordered-project" className="btn btn-outline-primary" onClick={(e) => onClickExport(e)}>Export To Excel</button>
                      </div>
                    </div>
                  </div>
              </div>
              

              <div className="row">
                <div className="col-12">
                    <div className="card widget-inline">
                        <div className="card-body p-0">
                            <div className="row g-0">

                            <div id="product_card" className="col-sm-6 col-lg-6">
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center">
                                            <i className="ri-group-line text-muted font-24"></i>
                                            <h3><span>{products.length}</span></h3>
                                            <p className="text-muted font-15 mb-0">Product Types</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="product_id_card" className="col-sm-6 col-lg-5">
                                    <div className="card rounded-0 shadow-none m-0 border-start border-light">
                                        <div className="card-body text-center" onClick={onClickExport}>
                                            <i className="ri-group-line text-muted font-24"></i>
                                            <h3><span>{productIDs}</span></h3>
                                            <p className="text-muted font-15 mb-0">Product Ids</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div> 
                </div>
              </div>

              <div className="accordion custom-accordion" id="CardaccordionExample">
              { 
                products.map((product) => {
                  return (
                      <div className="card mb-0" key={product.product_type}>
                        <div className="card-header" id="CardheadingOne">
                            <h5 className="m-0">
                                <a className="custom-accordion-title d-block pt-2 pb-2"
                                    data-bs-toggle="collapse" href={`#product${product.product_type}`}
                                    aria-expanded="true" aria-controls={`product${product.product_type}`}>
                                    Product - {product.product_type}
                                </a>
                            </h5>
                        </div>

                        <div id={`product${product.product_type}`} className="collapse show"
                            aria-labelledby="CardheadingOne">
                            <div className="card-body">
                              <ProductTableCard productType={product.product_type} productDetails={product.product_details}></ProductTableCard>
                            </div>
                        </div>
                      </div>
                  )
                })
              }   
              </div>                              
            </div>
        </div>
    </div>
    
  )
}