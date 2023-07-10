import { ProjectMasterListForm } from '../../components/project-master-list/project-master-list.component';

export const CreateProjectPage = () => {
  return (
    <div className="content-page">
        <div className="content">
            <div className="container-fluid">
              <div className="row">
                  <div className="col-12">
                      <div className="page-title-box">
                          <h4 className="page-title">Create Project</h4>
                      </div>
                  </div>
              </div>
              <div  className="row">
                <ProjectMasterListForm></ProjectMasterListForm>
              </div>
            </div>
        </div>
    </div>
    
  )
}