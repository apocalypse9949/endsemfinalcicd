'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaUser, FaTimes } from 'react-icons/fa';
import './page.css';

export default function Dashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      console.log('Fetched jobs:', data);
      setJobs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setDepartmentFilter('all');
      setJobTypeFilter('all');
    }
  };

  const filteredJobs = jobs.filter(job => {
    console.log('Checking job:', job);
    if (!job || !job.title || !job.location || !job.department || !job.jobType) {
      console.log('Job missing required fields:', {
        hasTitle: !!job?.title,
        hasLocation: !!job?.location,
        hasDepartment: !!job?.department,
        hasJobType: !!job?.jobType
      });
      return false;
    }

    const searchFields = [
      job.title,
      job.location,
      job.department,
      job.jobType,
      ...(job.requirements || []),
      job.description || ''
    ].map(field => field.toLowerCase());

    const searchTerms = searchTerm.toLowerCase().split(' ');
    const matchesSearch = searchTerms.every(term => 
      searchFields.some(field => field.includes(term))
    );
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      job.department.toLowerCase() === departmentFilter.toLowerCase();
    
    const matchesJobType = 
      jobTypeFilter === 'all' || 
      job.jobType.toLowerCase() === jobTypeFilter.toLowerCase();

    const matches = matchesSearch && matchesDepartment && matchesJobType && (job.status === 'Active' || !job.status);
    if (!matches) {
      console.log('Job filtered out:', {
        matchesSearch,
        matchesDepartment,
        matchesJobType,
        isActive: job.status === 'Active' || !job.status
      });
    }
    return matches;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="main-header">
        <div className="logo">
          <h1>Lancer</h1>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search jobs by title, company, skills, or location..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="search-button">
            <FaSearch />
          </button>
        </div>

        <div className="header-nav">
          <Link href="/dashboard/input" className="nav-link">Mentorship</Link>
          <Link href="/dashboard/resume" className="nav-link">Resume Builder</Link>
          <Link href="/scanner" className="nav-link">ATS Scanner</Link>
          <div className="profile-dropdown">
            <button className="profile-button">
              <FaUser />
            </button>
            <div className="dropdown-content">
              <Link href="/dashboard/settings" className="dropdown-item">Settings</Link>
              <Link href="/auth" className="dropdown-item">Log out</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {showNotification && (
        <div className="notification-banner">
          <div className="notification-content">
            <div className="notification-left">
              <div className="notification-icon">
                <span className="sparkle">✨</span>
              </div>
              <div className="notification-text">
                <h2>Complete your profile</h2>
                <p>Enhance your job search experience by updating your profile details.</p>
              </div>
            </div>
            <div className="notification-actions">
              <Link href="/dashboard/settings" className="update-button">
                Update Profile
                <span className="arrow">→</span>
              </Link>
              <button 
                className="close-notification"
                onClick={() => setShowNotification(false)}
                aria-label="Close notification"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          <div className="progress-bar"></div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-header">
        <div className="filter-dropdowns">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Job Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={fetchJobs} className="retry-btn">Retry</button>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.length === 0 ? (
              <div className="no-jobs">
                <h3>No jobs found</h3>
                <p>Try adjusting your search terms or filters</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Link 
                  href={`/dashboard/apply?jobId=${job.jobId}`}
                  key={job.jobId} 
                  className="job-card"
                >
                  <div className="job-card-header">
                    <div className="company-logo">
                      {job.logo ? (
                        <Image src={job.logo} alt={`${job.companyName || job.company} logo`} width={50} height={50} unoptimized />
                      ) : (
                        <span>{(job.companyName || job.company || 'C')[0]}</span>
                      )}
                    </div>
                    <div className="job-info">
                      <h3>{job.title}</h3>
                      <p className="company">{job.companyName || job.company || 'Company Name Not Available'}</p>
                    </div>
                    <div className="job-id">#{job.jobId}</div>
                  </div>
                  <div className="job-details">
                    <div className="detail">
                      <span className="icon">📍</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">💼</span>
                      <span>{job.jobType}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">🏢</span>
                      <span>{job.department}</span>
                    </div>
                    {!job.hideSalary && (
                      <div className="detail">
                        <span className="icon">💰</span>
                        <span>
                          ${typeof job.salaryMin === 'number' ? job.salaryMin.toLocaleString() : '0'} - 
                          ${typeof job.salaryMax === 'number' ? job.salaryMax.toLocaleString() : '0'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="job-footer">
                    <div className="tags">
                      {(Array.isArray(job.requirements)
                        ? job.requirements
                        : (job.requirements || '').split(',').map(s => s.trim()).filter(s => s)
                      ).slice(0, 3).map((req, index) => (
                        <span key={index} className="tag">{String(req)}</span>
                      ))}
                    </div>
                    <span className="posted-date">
                      Posted {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
