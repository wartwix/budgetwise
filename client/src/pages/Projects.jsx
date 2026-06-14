import React, { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';

function Projects() {
  const { projects, allocateToProject } = useContext(BudgetContext);

  const handleAllocate = (project) => {
    const amount = window.prompt(`Combien souhaitez-vous allouer au projet "${project.name}" ?\nReste à financer : ${project.target - project.saved} €`);
    if (amount) {
      allocateToProject(project.id, amount);
    }
  };

  return (
    <div>
      <h3 className="text-vert-foret mb-4">Mes Projets & Objectifs</h3>
      <div className="row">
        {projects.map(p => (
          <div key={p.id} className="col-md-4">
            <div className="card p-4 text-center">
              <h5 className="fw-bold">{p.name}</h5>
              <p className="text-muted mb-4">{p.saved.toLocaleString()} € / {p.target.toLocaleString()} €</p>
              
              <div className="progress mb-3" style={{ height: '20px' }}>
                <div className="progress-bar bg-violet-projet" style={{ width: `${p.progress}%` }}>
                  {p.progress}%
                </div>
              </div>
              
              <button 
                className="btn btn-outline-success w-100" 
                onClick={() => handleAllocate(p)}
                disabled={p.saved >= p.target}
              >
                {p.saved >= p.target ? '✓ Objectif atteint !' : '+ Allouer des fonds'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;