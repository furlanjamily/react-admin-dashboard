import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun } from "lucide-react"; // Ícones de clima
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"; // Importando o gráfico de pizza

// Definindo a interface para os dados da API
interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    description: string;
  }[];
}

// Função para contar as ocorrências de cada descrição climática
const getWeatherDescriptionsCount = (data: WeatherData) => {
  const descriptions = data.weather.map((item) => item.description);
  const descriptionCounts: { [key: string]: number } = {};

  descriptions.forEach((description) => {
    descriptionCounts[description] = (descriptionCounts[description] || 0) + 1;
  });

  return Object.entries(descriptionCounts).map(([key, value]) => ({
    name: key,
    value: value,
  }));
};

const OverviewCards = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<string | null>(null);

  // Função para buscar dados do clima
  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=41355a36ba9641a934c60854c825c9bd&units=metric&lang=pt_br`
      );
      setWeatherData(response.data); // Armazena os dados do clima
      setRequestTime(new Date().toLocaleTimeString()); // Define o horário da requisição
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Cidade não encontrada. Tente novamente.");
    }
  };

  return (
    <div className="w-full grid grid-cols-3 gap-3 mb-8">
      {/* Informações sobre o clima */}
      <motion.div
        key="climate-info"
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-8 border border-gray-700 col-span-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="mt-1 text-xl font-semibold text-gray-100">Temperatura</p>
          </div>
        </div>

        <div className="mt-3">
          {/* Campo de pesquisa e exibição do clima */}
          <div className="flex items-center mt-4">
            <input
              type="text"
              className="p-3 rounded border text-black text-lg w-2/3"
              placeholder="Digite a cidade..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              onClick={fetchWeatherData}
              className="ml-4 p-3 bg-blue-500 text-white rounded text-lg"
            >
              Buscar
            </button>
          </div>

          {/* Mensagem de aviso e exibição da temperatura */}
          <div className="flex items-center justify-between mt-4">
            {loading ? (
              <span>Carregando...</span>
            ) : weatherData ? (
              <div className="flex items-center">
                <Sun className="mr-2 text-yellow-400" />
                <span className="text-xl font-semibold">{`${weatherData.main.temp}°C`}</span>
              </div>
            ) : (
              <span className="text-gray-400">Digite uma cidade para ver o clima</span>
            )}
          </div>

          {requestTime && (
            <div className="mt-4 text-gray-400">
              <span>Hora da requisição: {requestTime}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Gráfico de pizza */}
      <div className="col-span-2">
        <h2 className="text-xl font-semibold text-gray-100 justify-center">Clima Predominante</h2>
        {loading ? (
          <div className="flex justify-center">Carregando...</div>
        ) : (
          weatherData && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
              <div>{city} </div>
                <Pie
                  data={getWeatherDescriptionsCount(weatherData)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getWeatherDescriptionsCount(weatherData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
};

export default OverviewCards;
