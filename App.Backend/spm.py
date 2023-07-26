from flask import Flask, request, jsonify,Response, json
from flask.globals import g
from flask_cors import CORS
import sys
import os
import json
# from datetime import date
from datetime import datetime
path = os.path.dirname(os.path.abspath(__file__))

sys.path.append(path)
from dbutil import DBUtil

import logging
logging.basicConfig(filename='spm.log', encoding='utf-8', level=logging.INFO)

app = Flask(__name__)
CORS(app)

app = Flask(__name__, template_folder='.')
app.secret_key = "3934d693ff3df8d7228dda5972002da4"

@app.route('/spm/login', methods = ["GET"])
def login():
  try:
    email = request.args.get("email", None)
    passphrase = request.args.get("password", "")
    logging.info("Request params: "+str(request.args))
    result = {}
    if email:
      query = """select name, email, designation, is_admin, employee_id from users where email = %s and (login_pass = %s or login_pass is null)"""
      query_result = DBUtil().execute_query(query, (email,passphrase,))

      if len(query_result):
        name = query_result[0].get("name", "")
        email = query_result[0].get("email", "")
        designation = query_result[0].get("designation", "")
        is_admin = query_result[0].get("is_admin", "")
        employee_id = query_result[0].get("employee_id", "")
        result = {
          "login": "1",
          "name": name,
          "designation": designation,
          "email": email,
          "is_admin": is_admin,
          "id": employee_id
        }
      else:
        result = {
          "login": "0"
        }
    else:
      logging.error("Data not sufficient...")
    
    response = Response(json.dumps(result, default= str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    logging.info("Result: "+str(response))
    return response
  except Exception as e:
    logging.info(e)
    raise e


# ---------- create project ----------
def add_new_project(project_name, created_by):
  try:
    # add entry to projects table
    query = """ insert into projects (project_name, created_by) values (%s, %s)"""
    DBUtil().execute_query(query, (project_name, created_by,), commit=True)
    # get the project_id created
    query = """select project_id from projects where project_name = %s and created_by = %s"""
    result = DBUtil().execute_query(query, (project_name, created_by,))
    # return project_id
    if result and len(result)>0:
      logging.info("Project Created...: "+str(project_name))
      return result[0].get("project_id", None)
    return None
  except Exception as e:
    logging.error(e)
    raise e

def add_new_project_items(data):
  if data:
    query = """ insert into project_master_list (project_id, product_type, product_id, required_quantity, required_by_date, quantity_type) 
                values (%s, %s, %s, %s, %s, %s)"""
    DBUtil().execute_query(query, data, executemany=True, commit=True)
    logging.info("Added items to Project Master List Successfully...")

@app.route('/spm/create_project', methods = ["POST"])
def create_project():
  try:
    req_data = request.get_json(force=True)
    logging.info("Request JSON Body: "+str(req_data))

    data = []
    project_name = req_data.get('project_name', "").upper()
    project_details = req_data.get('project_details', None)
    created_by = req_data.get('created_by', None)
    if project_name and project_details:
      # add new project and get the project_id
      project_id = add_new_project(project_name, created_by)
      # add items to project master list
      for productDetail in project_details:
        required_quantity = productDetail.get("required_quantity", "")
        required_by_date = productDetail.get("required_by_date", "")
        product_type = productDetail.get("product_type", "").upper()
        product_id = productDetail.get("product_id", "").upper()
        quantity_type = productDetail.get("quantity_type", "")

        data.append((project_id, product_type, product_id, required_quantity, required_by_date, quantity_type))
      # add new entries
      add_new_project_items(data)
    else:
      logging.error("Data not sufficient.....")
  except Exception as e:
    logging.error(e)
    raise e
  return {}

# -------- update project ------------
def update_project(project_id, project_name, updated_by, updated_on):
  try:
    query = """update projects set project_name = %s, last_updated_by = %s, last_updated_at = %s
              where project_id = %s  
    """
    data = (project_name, updated_by, datetime.strftime(updated_on, '%Y-%m-%d %H:%M:%S'), project_id)
    logging.info("Data: "+str(data))
    DBUtil().execute_query(query, data, commit=True)
    logging.info("Project Updated Successfully...: "+str(project_name))
  except Exception as e:
    logging.error(e)
    raise e

@app.route('/spm/update_project', methods= ["POST"])
def update_project_details():
  try:
    req_data = request.get_json(force=True)
    logging.info("Request JSON Body: "+str(req_data))

    insert_data = []
    update_data = []
    project_id = req_data.get("project_id", None)
    project_name = req_data.get('project_name', "").upper()
    project_details = req_data.get('project_details', None)
    updated_by = req_data.get('updated_by', None)
    updated_on = req_data.get('updated_on', None)

    if updated_on:
      updated_on = datetime.fromtimestamp(updated_on/1000.0)
    
    if project_name and project_id:
      # update project
      update_project(project_id, project_name, updated_by, updated_on)
      
      # add items to project master list
      for item in project_details:
        project_comp_id = item.get("project_comp_id", "")
        required_quantity = item.get("required_quantity", "")
        required_by_date = item.get("required_by_date", "")
        quantity_type = item.get("quantity_type", "")
        
        if project_comp_id:
          used_quantity = item.get("used_quantity", 0)
          dispatched_quantity = item.get("dispatched_quantity", 0)
          update_data.append((required_quantity, required_by_date, quantity_type, used_quantity, dispatched_quantity, project_comp_id))
        else:
          product_type = item.get("product_type", "").upper()
          product_id = item.get("product_id", "").upper()
          insert_data.append((project_id, product_type, product_id, required_quantity,required_by_date, quantity_type))
      
      #update entries
      query = """ update project_master_list set required_quantity = %s, required_by_date = %s, quantity_type = %s,
                  used_quantity = %s, dispatched_quantity = %s
                  where project_comp_id = %s
              """
      DBUtil().execute_query(query, update_data, executemany=True, commit=True)

      # add new entries
      add_new_project_items(insert_data)
      logging.info("Project Master List Updated Successfully...")
    else:
      logging.error("Data not sufficient.....")
  except Exception as e:
    logging.error(e)
    raise e
  return {}

# --------- create purchase order --------------
def add_new_purchase_order(po_number, created_by):
  try:
    query = """ insert into purchase_orders (po_number, created_by) values 
                  (%s, %s)  
      """
    DBUtil().execute_query(query, (po_number, created_by,), commit=True)

    query = """select order_id from purchase_orders where po_number = %s and created_by = %s"""
    result = DBUtil().execute_query(query, (po_number, created_by,))

    if result and len(result)>0:
      logging.info("Purchase Order Created...: "+str(po_number))
      return result[0].get("order_id", None)
    return None
  except Exception as e:
    logging.error(e)
    raise e

def add_new_order_items(data):
  if data:
    query = """ insert into purchase_order_details (order_id, project_comp_id, ordered_quantity, expected_delivery, order_remark)
                  values (%s, %s, %s, %s, %s) """
    DBUtil().execute_query(query, data, executemany=True, commit=True)
    logging.info("Added items to Purchase Order List Successfully...")

def get_project_comp_id(project_id, product_type, product_id):
  try:
    query = """
        select project_comp_id from project_master_list where
        project_id = %s and product_type = %s and product_id = %s
      """
    query_result = DBUtil().execute_query(query, (project_id, product_type, product_id,))
    if query_result and len(query_result) == 1:
      return query_result[0].get("project_comp_id")
    else: 
      return None
  except Exception as e:
    logging.error(e)
    raise e

@app.route('/spm/create_order', methods = ["POST"])
def create_order():
  try:
    req_data = request.get_json(force=True)
    logging.info("Request JSON Body: "+str(req_data))

    data = []
    po_number = req_data.get('poNumber', None)
    productList = req_data.get('productList', None)
    created_by = req_data.get('created_by', None)
    if po_number and productList:
      # add new project
      order_id = add_new_purchase_order(po_number, created_by)
      # add items to project master list
      for productDetail in productList:
        ordered_quantity = productDetail.get("ordered_quantity", "")
        expected_delivery = productDetail.get("expected_delivery", "")
        order_remark = productDetail.get("order_remark", "")
        project_id = productDetail.get("project_id", "")
        product_type = productDetail.get("product_type", "").upper()
        product_id = productDetail.get("product_id", "").upper()
        project_comp_id = get_project_comp_id(project_id, product_type, product_id)
        data.append((order_id, project_comp_id, ordered_quantity, expected_delivery, order_remark))
      # add new entries
      add_new_order_items(data)
      logging.info("Order Details Added Successfully...")
    else:
      logging.error("Data not sufficient.....")
  except Exception as e:
    logging.error(e)
    raise e
  return {}

# --------- update purchase order --------------
def update_purchase_order(order_id, po_number, updated_by, updated_on):
  try:
    query = """update purchase_orders set po_number = %s, last_updated_by = %s, last_updated_at = %s
              where order_id = %s  
    """

    DBUtil().execute_query(query, (po_number, updated_by, datetime.strftime(updated_on, '%Y-%m-%d %H:%M:%S'), order_id,), commit=True)
    logging.info("Order Updated Successfully...: "+str(po_number))
  except Exception as e:
    logging.error(e)
    raise e

@app.route('/spm/update_order', methods= ["POST"])
def update_order_details():
  try:
    req_data = request.get_json(force=True)
    logging.info("Request JSON Body: "+str(req_data))

    update_data = []
    insert_data = []
    order_id = req_data.get('order_id', None)
    poNumber = req_data.get('po_number', "").upper()
    productList = req_data.get('orderDetails', None)
    updated_by = req_data.get('updated_by', None)
    updated_on = req_data.get('updated_on', None)
    if updated_on:
      updated_on = datetime.fromtimestamp(updated_on/1000.0)
    if poNumber and order_id:
      # update purchase order
      update_purchase_order(order_id, poNumber, updated_by, updated_on)
      
      # update items in purchase order details
      for productDetail in productList:
        order_comp_id = productDetail.get("order_comp_id", "")
        ordered_quantity = productDetail.get("ordered_quantity", "")
        expected_delivery = productDetail.get("expected_delivery", "")
        order_remark = productDetail.get("order_remark", "")
        if order_comp_id:
          update_data.append((ordered_quantity, expected_delivery, order_remark, order_comp_id))
        else: 
          project_id = productDetail.get("project_id", "")
          product_type = productDetail.get("product_type", "").upper()
          product_id = productDetail.get("product_id", "").upper()
          project_comp_id = get_project_comp_id(project_id, product_type, product_id)
          if project_comp_id:
            insert_data.append((order_id, project_comp_id, ordered_quantity, expected_delivery, order_remark))
          else:
            logging.error("Wrong products selected...")
    
      # update entries
      query = """ update purchase_order_details set ordered_quantity = %s, expected_delivery = %s, order_remark = %s
                  where order_comp_id = %s"""
      DBUtil().execute_query(query, update_data, executemany=True, commit=True)

      # add new entries
      add_new_order_items(insert_data)

      logging.info("Purchase Order Details Updated Successfully...")
    else:
      logging.error("Data not sufficient.....")
  except Exception as e:
    logging.error(e)
    raise e
  return {}

# ------ get purchase orders -----------
@app.route('/spm/get_purchase_orders', methods = ["GET"])
def get_purchase_order():
  try: 
    query = """select order_id, po_number from purchase_orders"""
    query_result = DBUtil().execute_query(query)
    result = query_result
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
  except Exception as e:
    logging.error(e)
    raise e

# --------- get projects name -------
@app.route('/spm/get_projects', methods= ['GET'])
def get_projects_name():
  try:
    query = """select project_id, project_name from projects"""
    query_result = DBUtil().execute_query(query)
    result = query_result
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
  except Exception as e:
    logging.error(e)
    raise e

# --------- get po numbers -------
@app.route('/spm/get_po_numbers', methods= ['GET'])
def get_po_numbers():
  try:
    query = """select po_number from purchase_orders"""
    query_result = DBUtil().execute_query(query)
    result = query_result
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
  except Exception as e:
    logging.error(e)
    raise e

# ------ get all products -------
@app.route('/spm/get_all_required_products', methods = ['GET'])
def get_all_required_products():
  try:
    query = """select p.project_id, p.project_name,
                pml.product_type, pml.product_id, pml.required_quantity, ifnull(ord.ordered,0) already_ordered
                from projects p, project_master_list pml
                left join (select project_comp_id, sum(ordered_quantity) ordered
                from purchase_order_details group by project_comp_id) ord on ord.project_comp_id = pml.project_comp_id
                where p.project_id = pml.project_id"""
    query_result = DBUtil().execute_query(query)
    result = query_result
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
  except Exception as e:
    logging.error(e)
    raise e
# ------  get project aggregation --------
@app.route('/spm/get_project_agg', methods = ['GET'])
def get_project_aggregation():
  try:
    query = """
      select p.project_id, p.project_name, users.name created_by, p.created_at,
      json_arrayagg(pml.product_id) as product_ids, 
      json_arrayagg(pml.product_type) as product_types
      from projects p
      join project_master_list pml
      on pml.project_id = p.project_id
      join users on p.created_by = users.employee_id
      group by p.project_id, p.project_name, p.created_by, users.name, p.created_at
      order by p.created_at desc
    """
    query_result = DBUtil().execute_query(query)
    result = query_result
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
  except Exception as e:
    logging.error(e)
    raise e

# ------ get project master list -----------
@app.route('/spm/get_project_items', methods = ["GET"])
def get_project_items():
  try:
    if request.method == "GET":
      project_name = request.args.get("project_name", None)
      logging.info("Request params: "+str(project_name))

    if project_name:
      query = """
        select p.project_id, pml.project_comp_id, 
        pml.product_type, pml.product_id, pml.required_quantity, 
        pml.required_by_date, pml.used_quantity, pml.dispatched_quantity, pml.quantity_type, 
        orders.recieved_quantity
        from projects p
        join project_master_list pml on pml.project_id = p.project_id
        left join 
        (select pod.project_comp_id, sum(ord.recieved_quantity) recieved_quantity from
        purchase_order_details pod, order_recieved ord
        where pod.order_comp_id = ord.order_comp_id and upper(ord.status) = 'ACCEPTED'
        group by pod.project_comp_id) orders
        on orders.project_comp_id = pml.project_comp_id
        where project_name = %s
      """
      query_result = DBUtil().execute_query(query, (project_name,))
    
    result = {
      "project_id": query_result[0].get("project_id"),
      "project_items": query_result
    }
    response = Response(json.dumps(result, default= str))
    response.headers['Access-Control-Allow-Origin'] = '*'

    logging.info("Result: "+str(response))
    return response
  except Exception as e:
    logging.error(e)
    raise e


# ------  get project aggregation --------
@app.route('/spm/get_po_agg', methods = ['GET'])
def get_po_aggregation():
  try:
    query = """
      select p.po_number, users.name created_by, p.created_at, 
      json_arrayagg(pml.product_id) as product_ids, 
      json_arrayagg(pml.product_type) as product_types
      from purchase_orders p
      join purchase_order_details pod
      on pod.order_id = p.order_id
      join project_master_list pml
      on pml.project_comp_id = pod.project_comp_id
      join users on p.created_by = users.employee_id
      group by p.po_number, users.name, p.created_at
      order by p.created_at desc
    """
    query_result = DBUtil().execute_query(query)
    result = query_result
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
  except Exception as e:
    logging.error(e)
    raise e

# ------ get order master list -----------
@app.route('/spm/get_order_details', methods = ["GET"])
def get_order_details():
  try:
    po_number = request.args.get("po_number", None)
    logging.info("Request params: "+str(po_number))

    if po_number:
      query = """
        select po.order_id, po.po_number, pod.order_comp_id,
          p.project_name, pml.product_id, pml.product_type, pod.order_remark,
          pml.required_quantity, pod.ordered_quantity, pod.expected_delivery,
          ifnull(porders.total_ordered,0) total_ordered,
          ifnull(rorders.already_recieved,0) already_recieved
        from projects p
        join project_master_list pml on p.project_id = pml.project_id
        join purchase_order_details pod on pod.project_comp_id = pml.project_comp_id
        join purchase_orders po on po.order_id = pod.order_id
        left join(select project_comp_id, sum(ordered_quantity) total_ordered from purchase_order_details
                  group by project_comp_id) porders on porders.project_comp_id = pml.project_comp_id 
        left join (select order_comp_id, sum(recieved_quantity) already_recieved from order_recieved
              where status in ('Accepted', 'accepted', 'ACCEPTED') 
        			group by order_comp_id) rorders on rorders.order_comp_id = pod.order_comp_id
        where po.po_number = %s
      """
      query_result = DBUtil().execute_query(query, (po_number,))
    
    result = {
      "order_id": query_result[0].get("order_id"),
      "order_items": query_result
    }
    response = Response(json.dumps(result, default= str))
    response.headers['Access-Control-Allow-Origin'] = '*'

    logging.info("Result: "+str(response))
    return response
  except Exception as e:
    logging.error(e)
    raise e

# -------- add recieved order details -------------
@app.route('/spm/recieve_order', methods= ['POST'])
def recieve_order():
  try:
    req_data = request.get_json(force=True)
    logging.info("Request JSON Body: "+str(req_data))

    history_data = []
    po_id = req_data.get("po_id", None);
    productList = req_data.get('productList', None)
    challan_bill = req_data.get('bill', "").upper()
    if po_id and productList and challan_bill:
      for productDetail in productList:
        order_comp_id = productDetail.get("order_comp_id", None)
        recieved_quantity = productDetail.get("recieved_quantity", None)
        recieved_date = productDetail.get("recieved_date", None)
        delivery_remark = productDetail.get("delivery_remark", None)
        status = productDetail.get("status", "").upper()
        history_data.append((challan_bill, order_comp_id, recieved_quantity, recieved_date, delivery_remark, status))

      query = """ insert into order_recieved (challan_id, order_comp_id, recieved_quantity, recieved_at, recieved_remark, status) values
                  (%s, %s, %s, %s, %s, %s)    
              """
      DBUtil().execute_query(query, history_data, executemany=True, commit=True)
      logging.info("Order Recieved Data added successfully...")
    else:
      logging.error("Data not sufficient.....")
  except Exception as e:
    logging.error(e)
    raise e
  return {}

@app.route('/spm/get_dashboard_items', methods = ['GET'])
def get_dashboard():
  try:
    #result = {project_count, products_ordered, order_count}
    query = """
              select p.project_id, p.project_name, pml.product_type, pml.product_id, pml.quantity_type,
                sum(pml.required_quantity) required_quantity,
                sum(ifnull(orders.ordered_quantity,0)) ordered_quantity,
                sum(ifnull(orders.recieved_accepted,0)) recieved_accepted,
                sum(ifnull(orders.recieved_rejected,0)) recieved_rejected
              from projects p 
              join project_master_list pml on p.project_id = pml.project_id
              left join ( 
                select pod.project_comp_id,
                  ifnull(sum(pod.ordered_quantity),0) ordered_quantity,
                  ifnull(sum(rec_ord.recieved_accepted),0) recieved_accepted,
                  ifnull(sum(rec_ord.recieved_rejected),0) recieved_rejected
                from purchase_order_details pod
                left join (
                  select rec.order_comp_id, 
                    sum(CASE WHEN rec.status = 'Accepted' THEN rec.recieved_quantity END) recieved_accepted,
                    sum(CASE WHEN rec.status = 'Rejected' THEN rec.recieved_quantity END) recieved_rejected
                  from order_recieved rec
                  group by rec.order_comp_id) rec_ord
                on pod.order_comp_id = rec_ord.order_comp_id
                group by pod.project_comp_id) orders
              on pml.project_comp_id = orders.project_comp_id
              group by p.project_id, p.project_name, pml.product_type, pml.product_id, pml.quantity_type
            """
    query_result = DBUtil().execute_query(query)

    query = """ select count(order_id) cnt from purchase_orders"""
    po_count = DBUtil().execute_query(query)[0].get('cnt', 0)

    project_dict = {}
    product_dict = {}
    for row in query_result:
      # row = {project_name, product_type, product_id, reuqired_quantity, recieved_accepted, recieved_rejected}
      project_name = row.get("project_name", "")
      product_type = row.get("product_type", "")
      if project_name in project_dict:
        project_dict[project_name].append(row)
      else: 
        project_dict[project_name] = [row]

      if product_type in product_dict:
        product_dict[product_type].append(row)
      else: 
        product_dict[product_type] = [row]

    result = {
      "projects": [],
      "products": [],
      "po": po_count
    }
    for project_name, project_details in project_dict.items():
      result["projects"].append({"project_name": project_name, "project_details": project_details})
    
    for product_type, product_details in product_dict.items():
      result["products"].append({"product_type": product_type, "product_details": product_details})

    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'

    logging.info("Result: "+str(response))
    return response
  except Exception as e:
    logging.error(e)
    raise e


@app.route('/spm/get_inventory', methods = ['GET'])
def get_inventory():
  try:
    #result = {project_count, products_ordered, order_count}
    query = """
              select pml.product_id, pml.product_type, pml.quantity_type, sum(ord.recieved_quantity) recieved, 
              sum(pml.used_quantity) used, sum(pml.dispatched_quantity) dispatched
              from order_recieved ord, project_master_list pml, purchase_order_details pod
              where pod.order_comp_id = ord.order_comp_id
              and pod.project_comp_id = pml.project_comp_id
              and upper(ord.status) = 'ACCEPTED'
              group by pml.product_id, pml.product_type, pml.quantity_type
            """
    query_result = DBUtil().execute_query(query)


    product_dict = {}
    product_ids = {}
    for row in query_result:
      product_type = row.get("product_type", "")
      product_id = row.get("product_id", "")
      # row = {product_id, product_type, recieved, used, dispatched}
      if product_type in product_dict:
        product_dict[product_type].append(row)
      else: 
        product_dict[product_type] = [row]
      
      product_ids[product_id] = 1

    result = {
      "products": [],
      "product_ids": len(product_ids)
    }
    
    for product_type, product_details in product_dict.items():
      result["products"].append({"product_type": product_type, "product_details": product_details})

    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'

    logging.info("Result: "+str(response))
    return response
  except Exception as e:
    logging.error(e)
    raise e

@app.route('/spm/get_products', methods = ['GET'])
def  get_products():
  try:
    query = """
      select pml.product_id, pml.product_type, ord.challan_id, 
      ord.recieved_quantity, ord.status
      from order_recieved ord, project_master_list pml, purchase_order_details pod
      where pod.order_comp_id = ord.order_comp_id
      and pod.project_comp_id = pml.project_comp_id
    """

    query_result = DBUtil().execute_query(query)
    result = {
      "products": query_result
    }
    response = Response(json.dumps(result, default=str))
    response.headers['Access-Control-Allow-Origin'] = '*'

    logging.info("Result: "+str(response))
    return response
  except Exception as e:
    logging.error(e)
    raise e



@app.route('/')
def home():
  logging.info("Home page hit...")
  return "<h1> Hello World </h1>"