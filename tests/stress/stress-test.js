import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Sobe para 50 usuários em 2 min
    // { duration: '5m', target: 50 },  // Fica em 50 usuários por 5 min
    { duration: '2m', target: 150 }, // Sobe para 150 usuários em 2 min (Estresse)
    // { duration: '5m', target: 150 }, // Mantém o estresse por 5 min
    { duration: '2m', target: 0 },   // Desce para 0
  ],
};

const BASE_URL = 'http://ec2-32-192-239-253.compute-1.amazonaws.com:30080'; // Ou o IP do seu LoadBalancer/NodePort

export default function () {
  const url = `${BASE_URL}/api/clientes`; // Substitua pela sua rota
  const res = http.get(url);
  
  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo de resposta < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}