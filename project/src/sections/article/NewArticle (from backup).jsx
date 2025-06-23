import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MultiStepArticleForm = () => {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [citationCount, setCitationCount] = useState(0);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const navigate = useNavigate();
  const stepsIndex = ['Get Started', 'Build Article', 'Upload File', 'NFT Article'];

  // Manual form states
  const [manualTitle, setManualTitle] = useState('');
  const [manualAbstract, setManualAbstract] = useState('');
  const [manualInstitutions, setManualInstitutions] = useState('');
  const [manualKeywords, setManualKeywords] = useState('');
  const [manualMeshTerms, setManualMeshTerms] = useState('');
  const [citationHashIds, setCitationHashIds] = useState('');
  const [jupyterFile, setJupyterFile] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('https://aleflabs.net/api/categories/');
        console.log("✅ Categories response:", res.data);
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          console.error("❌ Expected an array but got:", res.data);
          setCategories([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Polling
  useEffect(() => {
    let interval;
    if (showModal && metadata?.query_hash) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get('https://aleflabs.net/api/get_progress', {
            params: { query_hash: metadata.query_hash },
          });
          const current = res.data?.current;
          if (current != null) {
            setCitationCount(current);
            if (res.data.total > 0 && current >= res.data.total) {
              clearInterval(interval);
              setShowModal(false);
              setSuccess(true);
              setStep(2);
            }
          }
        } catch (error) {
          console.error('❌ Citation polling error:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showModal, metadata]);
  

  const handleQuery = async () => {
    try {
      setLoading(true);
      const res = await axios.post('https://aleflabs.net/api/new_article/', { query: input });
      setMetadata(res.data);
      setSuccess(false);
    } catch (err) {
      console.error('❌ Failed to fetch article metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setShowModal(true);
      const formData = new FormData();
      formData.append("title", manualTitle);
      formData.append("abstract", manualAbstract);
      formData.append("institutions", manualInstitutions);
      formData.append("keywords", manualKeywords);
      formData.append("mesh_terms", manualMeshTerms);
      formData.append("category", category);  // ID of selected category
      formData.append("citation_hash_ids", citationHashIds);  // comma-separated
      formData.append("doi", "10.1234/example.doi");  
      if (jupyterFile) formData.append("jupyter_file", jupyterFile);

      await axios.post("https://aleflabs.net/api/article/create/", formData, {
        headers: {
          "X-CSRFToken": csrftoken,  // ✅ Needed for Django CSRF
          "Authorization": `Bearer ${token}`,
        },withCredentials: true,
      });
      print(formData)
      setSuccess(true);
      setStep(2);
    } catch (err) {
      console.error("❌ Failed to save article:", err);
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  const handleManualSubmit = async () => {
    try {
      setSubmitting(true);
      setShowModal(true);
      const formData = new FormData();
      formData.append("title", manualTitle);
      formData.append("abstract", manualAbstract);
      formData.append("institutions", manualInstitutions);
      formData.append("keywords", manualKeywords);
      formData.append("mesh_terms", manualMeshTerms);
      formData.append("category", category);
      formData.append("citation_hash_ids", citationHashIds);
      if (jupyterFile) formData.append("jupyter_file", jupyterFile);

      const response = await axios.post("https://aleflabs.net/api/manual/create/", formData, {
        headers: {
          "X-CSRFToken": csrftoken,  // ✅ Needed for Django CSRF
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true, // Optional but good to keep if CSRF is enforced
      });
      print(formData)
      if (response.data && response.data.query_hash) {
        navigate(`/rblock/${response.data.query_hash}`);
      }
      

      setMetadata({ query_hash: response.data.hash_id });
      setStep(2);
    } catch (error) {
      console.error("❌ Manual submit failed:", error);
      alert("Something went wrong while saving the article.");
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  const handleUpload = async (e) => {
    const csrfToken = getCookie('csrftoken');
    await axios.post('https://aleflabs.net/api/savefile/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true, // <— VERY IMPORTANT
      });

    e.preventDefault();
    const form = new FormData();
    form.append("query_hash", metadata.query_hash);
    form.append("save_file", e.target.file.files[0]);
    try {
      await axios.post('https://aleflabs.net/api/savefile/', form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Jupyter file uploaded!");
      setStep(3);
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload notebook.");
    }
  };

  const handleFinish = () => {
    navigate(`/rblock/${metadata.query_hash}`);
  };

  function getCookie(name) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue;
  }

  
      

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      <div className="text-center text-sm text-gray-500 mb-4">
        Step {step + 1} of 4: <strong>{stepsIndex[step]}</strong>
      </div>

      <div className="flex justify-center mb-6">
        <ol className="flex space-x-4 text-xs text-gray-500">
          {stepsIndex.map((label, index) => (
            <li key={index} className={`px-2 py-1 rounded ${index === step ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {label}
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center mb-6 space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isManualEntry}
                onChange={() => setIsManualEntry(!isManualEntry)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-white">
                Enter manually (Blockchain Article)
              </span>
            </label>
          </div>
          <h2 className="text-xl font-bold mb-4">🚀 Getting Started</h2>
          <ul className="list-disc list-inside text-sm mb-4">
            <li>PubMed ID or DOI of your article</li>
            <li>Jupyter Notebook (.ipynb or .html)</li>
            <li>Optional: NFT image</li>
            <li>Optional: ETH to mint the NFT</li>
          </ul>
          <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Get Started
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">🧠 Build Article</h2>

          {!isManualEntry && (
            <>
              <input type="text" placeholder="Enter PubMed ID or DOI" value={input} onChange={(e) => setInput(e.target.value)} className="border p-2 w-full mb-4" />
              <button onClick={handleQuery} className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4">
                {loading ? 'Fetching...' : 'Retrieve Metadata'}
              </button>

              {metadata && (
                <>
                  <p><strong>Title:</strong> {metadata.title}</p>
                  <p><strong>Abstract:</strong> {metadata.abstract}</p>
                  <p><strong>Authors:</strong> {metadata.authors}</p>
                  <p><strong>PMID:</strong> {metadata.pmid}</p>
                  <p><strong>DOI:</strong> {metadata.doi}</p>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-2 w-full mt-4"
                  >
                    <option value="">-- Choose a category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>

                  <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded w-full mt-4" disabled={!category || submitting}>
                    {submitting ? 'Submitting...' : 'Submit & Generate'}
                  </button>
                </>
              )}
            </>
          )}

          {isManualEntry && (
            <div className="mt-4 space-y-2">
              <input type="text" placeholder="Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)}   className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400"/>
              <textarea placeholder="Abstract" value={manualAbstract} onChange={(e) => setManualAbstract(e.target.value)} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400" />
              <input type="text" placeholder="Institutions" value={manualInstitutions} onChange={(e) => setManualInstitutions(e.target.value)} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400" />
              <textarea placeholder="Keywords (comma-separated)" value={manualKeywords} onChange={(e) => setManualKeywords(e.target.value)} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400" />
              <textarea placeholder="MeSH Terms (comma-separated)" value={manualMeshTerms} onChange={(e) => setManualMeshTerms(e.target.value)} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400" />
              <textarea placeholder="Citation Hash IDs (comma-separated)" value={citationHashIds} onChange={(e) => setCitationHashIds(e.target.value)} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400">
                <option value="">-- Choose a category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
              {/* <input type="file" accept=".ipynb" onChange={(e) => setJupyterFile(e.target.files[0])} className="border p-2 w-full bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400"/> */}
              <button onClick={handleManualSubmit} className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Blockchain Article"}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">📤 Upload Jupyter Notebook</h2>
          {!success ? (
            <form onSubmit={handleUpload}>
              <input type="file" name="file" accept=".html,.ipynb" className="mb-4" required />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Upload File</button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-500 font-medium">✅ File uploaded successfully!</p>
              <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Continue to NFT Minting</button>
              <button onClick={handleFinish} className="text-sm text-gray-500 hover:text-indigo-600 underline">Skip NFT step and view Article →</button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 text-center p-8 rounded-lg shadow-xl max-w-md">
            <h2 className="text-xl font-semibold mb-4">🚧 Please Be Patient</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              We're building your article. This may take up to 15 minutes depending on citation complexity.
            </p>
            <div className="mt-4 animate-pulse">
              <span className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepArticleForm;
