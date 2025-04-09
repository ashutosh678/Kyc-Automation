export interface IConfig {
	port: number;
	uploadDir: string;
	maxFileSize: number;
	allowedFileTypes: string[];
	corsOptions: {
		origin: string | string[];
		methods: string[];
	};
}
