import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { toast } from 'react-toastify';
import { FaFolder, FaFilePdf, FaLock } from 'react-icons/fa';
import axios from 'axios';

export default function FileList({ user }) {
  const [folders, setFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedFolders, setPurchasedFolders] = useState([]);

  useEffect(() => {
    const database = getDatabase();
    const filesRef = ref(database, 'files');
    const purchasesRef = ref(database, `purchases/${user.uid}`);

    const unsubscribeFiles = onValue(filesRef, (snapshot) => {
      const foldersData = {};
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const fileData = childSnapshot.val();
          const { folder, subfolder, name, pdfId, date } = fileData;
          const formattedDate = new Date(date).toLocaleDateString();

          if (!foldersData[folder]) foldersData[folder] = {};
          if (subfolder) {
            if (!foldersData[folder][subfolder]) foldersData[folder][subfolder] = [];
            foldersData[folder][subfolder].push({ name, pdfId, date: formattedDate });
          } else {
            if (!foldersData[folder]['_files']) foldersData[folder]['_files'] = [];
            foldersData[folder]['_files'].push({ name, pdfId, date: formattedDate });
          }
        });
      } else {
        toast.info('No files available in the database.');
      }
      setFolders(foldersData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading files:', error);
      toast.error(`Error loading files: ${error.message}`);
      setLoading(false);
    });

    const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
      const purchases = snapshot.val() || {};
      setPurchasedFolders(Object.keys(purchases));
    }, (error) => {
      console.error('Error loading purchases:', error);
      toast.error(`Error loading purchases: ${error.message}`);
    });

    return () => {
      unsubscribeFiles();
      unsubscribePurchases();
    };
  }, [user]);

  const handlePurchase = async (folder) => {
    try {
      const price = folder.includes('premium') ? 10 : 5;
      const response = await axios.post('/api/create-order', {
        userId: user.uid,
        folder,
        amount: price,
      });
      const { orderId, paymentSessionId } = response.data;

      const cashfree = new window.Cashfree({
        mode: 'production',
      });

      cashfree.checkout({
        paymentSessionId,
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/view?orderId={order_id}`,
      }).then(() => {
        console.log('Payment initiated for order:', orderId);
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(`Error initiating payment: ${error.message}`);
    }
  };

  useEffect(() => {
    const fileList = document.getElementById('fileList');
    const handleRefresh = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    };
    fileList?.addEventListener('refresh', handleRefresh);
    return () => fileList?.removeEventListener('refresh', handleRefresh);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredFolders = Object.keys(folders).filter((folder) =>
    folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div id="loading" className={loading ? 'flex justify-center' : 'hidden'}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
      </div>
      <div id="fileList" className="max-h-[70vh] overflow-y-auto">
        {Object.keys(folders).length === 0 && !loading ? (
          <div className="text-center text-gray-600">No courses available.</div>
        ) : (
          <ul className="space-y-2">
            {filteredFolders.map((folder) => {
              const isPurchased = purchasedFolders.includes(folder);
              return (
                <li
                  key={folder}
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => setOpenFolder(openFolder === folder ? null : folder)}
                >
                  <div className="flex items-center">
                    <FaFolder className="text-yellow-500 mr-2" />
                    {folder}
                    {!isPurchased && <FaLock className="ml-2 text-red-500" />}
                  </div>
                  <div className={`collapsible-content ${openFolder === folder ? '' : 'hidden'} pl-6 space-y-2 mt-2`}>
                    {isPurchased ? (
                      <>
                        {Object.keys(folders[folder]).map((subfolder) => (
                          <div key={subfolder}>
                            {subfolder !== '_files' && (
                              <div className="bg-gray-100 rounded p-2 flex items-center">
                                <FaFolder className="text-blue-500 mr-2" />
                                {subfolder}
                              </div>
                            )}
                            {folders[folder][subfolder].map((file) => (
                              <div
                                key={file.pdfId}
                                className="flex justify-between items-center bg-white p-2 rounded ml-4 mt-1 hover:bg-blue-50"
                              >
                                <a href={`/view?pdfid=${file.pdfId}`} className="text-blue-600 flex items-center">
                                  <FaFilePdf className="mr-2" />
                                  {file.name}
                                </a>
                                <span className="text-gray-500 text-sm">{file.date}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    ) : (
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2"
                        onClick={() => handlePurchase(folder)}
                      >
                        Buy Course (₹{folder.includes('premium') ? 10 : 5})
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <input
        type="text"
        id="searchInput"
        className="hidden"
        onChange={handleSearch}
      />
    </>
  );
}
