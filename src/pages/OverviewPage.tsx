import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/common/Header";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Tipagem da estrutura de dados esperada
interface WeatherData {
  list: Array<{
    dt_txt: string;
    main: { temp: number };
    weather: Array<{ description: string }>;
  }>;
}

// Component para a página Overview
const OverviewPage = () => {
  const [city, setCity] = useState("São Paulo");
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<WeatherData | null>(null); // Tipando como WeatherData ou null
  const [loading, setLoading] = useState(false);

  // Função para buscar os dados da cidade na API
  const fetchData = async (cityName: string) => {
    try {
      setLoading(true);
      const response = await axios.get<WeatherData>( // Tipando a resposta da API
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=41355a36ba9641a934c60854c825c9bd&units=metric&lang=pt_br`
      );
      setData(response.data); // Agora a resposta tem o tipo correto
      setCity(cityName);
      setLoading(false);
    } catch (error) {
      alert("Cidade não encontrada. Verifique o nome e tente novamente.");
      setLoading(false);
    }
  };
  

  // Efeito para carregar dados quando a página for acessada
  useEffect(() => {
    fetchData(city);
  }, [city]);

  // Função de busca acionada pelo botão
  const handleSearch = () => {
    if (inputValue.trim()) {
      fetchData(inputValue);
    }
  };

  // Função para transformar dados para o gráfico de linha (temperaturas ao longo das próximas 24 horas)
  const transformDataForLineChart = () => {
    if (!data) return [];

    const now = new Date();
    const currentTime = now.getTime(); // Hora atual em milissegundos

    // Filtrando as previsões para as próximas 24 horas
    const next24HoursForecast = data.list.filter((item) => {
      const forecastTime = new Date(item.dt_txt).getTime(); // Converte o tempo da previsão para milissegundos
      return forecastTime > currentTime && forecastTime <= currentTime + 24 * 60 * 60 * 1000; // Próximas 24 horas
    });

    return next24HoursForecast.map((item) => ({
      time: item.dt_txt.split(" ")[1].slice(0, 5), // Hora no formato HH:MM
      temp: item.main.temp, // Temperatura
    }));
  };

  // Função para transformar dados para o gráfico de pizza (resumo do clima)
  const transformDataForPieChart = () => {
    if (!data) return [];
    const weatherSummary: Record<string, number> = {}; // Tipando como um objeto de chave string e valor number

    data.list.forEach((item) => {
      const weatherType = item.weather[0].description;
      weatherSummary[weatherType] = (weatherSummary[weatherType] || 0) + 1;
    });

    return Object.entries(weatherSummary).map(([key, value]) => ({
      name: key,
      value,
    }));
  };

  // Função para transformar dados para o gráfico de barras (média de temperaturas por mês)
  const transformDataForBarChart = () => {
    if (!data) return [];
    const monthlyAverage = Array(12).fill(0);
    const monthlyCount = Array(12).fill(0);

    data.list.forEach((item) => {
      const month = new Date(item.dt_txt).getMonth();
      monthlyAverage[month] += item.main.temp;
      monthlyCount[month] += 1;
    });

    return monthlyAverage.map((total, index) => ({
      month: new Date(2020, index).toLocaleString("default", { month: "short" }),
      avgTemp: total / (monthlyCount[index] || 1), // Evitar divisão por zero
    }));
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Previsão do tempo" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Campo de Busca */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              className="p-2 rounded border text-black"
              placeholder="Digite o nome da cidade"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded">
              Buscar
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Pizza */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-100">Resumo do Clima - {city}</h2>
            {loading ? (
              <div className="flex justify-center">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transformDataForPieChart()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value} %)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transformDataForPieChart().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Linha - Temperaturas ao Longo do Dia */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-100">Temperaturas ao Longo do Dia</h2>
            {loading ? (
              <div className="flex justify-center">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transformDataForLineChart()}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Média de Temperaturas por Mês */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100">Média de Temperaturas por Mês</h2>
          {loading ? (
            <div className="flex justify-center">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transformDataForBarChart()}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTemp" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
