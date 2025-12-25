import axios from 'axios';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [dataTest, setDataTest] = useState<any>(null);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get('/api/Auth/test-api');
    console.log(res);
    setDataTest(res.data);
  };

  return <>{dataTest?.message}</>;
}
